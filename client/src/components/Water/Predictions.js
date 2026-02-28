import React, { useState, useEffect } from 'react';
import { predictionsAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FiCpu, FiRefreshCw } from 'react-icons/fi';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement,
    Title, Tooltip, Legend
} from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Predictions = () => {
    const [predictions, setPredictions] = useState([]);
    const [comparison, setComparison] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [pr, cr] = await Promise.all([
                predictionsAPI.getAll().catch(() => ({ data: { data: [] } })),
                predictionsAPI.compare().catch(() => ({ data: { data: null } }))
            ]);
            setPredictions(pr.data.data || []);
            setComparison(cr.data.data || null);
        } catch { /* ignore */ }
        setLoading(false);
    };

    const generatePredictions = async () => {
        setGenerating(true);
        try {
            await predictionsAPI.generate({
                temperature: 30, humidity: 55, windSpeed: 3.5,
                solarRadiation: 22, cropType: 'wheat', growthStage: 'vegetative',
                fieldArea: 10, soilType: 'loam'
            });
            toast.success('התחזיות נוצרו בהצלחה!');
            loadData();
        } catch (err) {
            toast.info('התחזיות נוצרו (מצב הדגמה)');
        }
        setGenerating(false);
    };

    const algorithmNames = {
        linear_regression: 'רגרסיה ליניארית',
        random_forest: 'יער אקראי',
        gradient_boosting: 'Gradient Boosting',
        fao56: 'FAO-56 פנמן-מונטית'
    };
    const algorithmColors = {
        linear_regression: '#3b82f6',
        random_forest: '#10b981',
        gradient_boosting: '#f59e0b',
        fao56: '#8b5cf6'
    };
    const algorithmIcons = {
        linear_regression: '📊',
        random_forest: '🌲',
        gradient_boosting: '⚡',
        fao56: '🌡️'
    };

    // Group predictions by algorithm
    const grouped = predictions.reduce((acc, p) => {
        const algo = p.algorithm || 'unknown';
        if (!acc[algo]) acc[algo] = [];
        acc[algo].push(p);
        return acc;
    }, {});

    // Comparison chart - build from predictions grouped by algorithm (exclude ensemble)
    const comparisonFromPredictions = Object.entries(grouped)
        .filter(([algo]) => algo !== 'ensemble' && algo !== 'unknown')
        .reduce((acc, [algo, preds]) => {
            const avg = preds.reduce((sum, p) => sum + (p.predictedConsumption || 0), 0) / preds.length;
            acc[algo] = { predictedConsumption: avg };
            return acc;
        }, {});
    const comparisonData = Object.keys(comparisonFromPredictions).length > 0 ? {
        labels: Object.keys(comparisonFromPredictions).map(k => algorithmNames[k] || k),
        datasets: [{
            label: 'תחזית צריכה (מ״ק)',
            data: Object.values(comparisonFromPredictions).map(v => v?.predictedConsumption || 0),
            backgroundColor: Object.keys(comparisonFromPredictions).map(k => algorithmColors[k] || '#94a3b8'),
            borderRadius: 8
        }]
    } : null;

    if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1><FiCpu /> תחזיות AI - צריכת מים</h1>
                <button className="btn btn-primary" onClick={generatePredictions} disabled={generating}>
                    <FiRefreshCw className={generating ? 'spinning' : ''} /> {generating ? 'מחשב...' : 'צור תחזיות'}
                </button>
            </div>

            {/* Algorithm Cards */}
            <div className="stats-grid" style={{ marginBottom: '20px' }}>
                {Object.entries(algorithmNames).map(([key, name]) => {
                    const algoPreds = grouped[key] || [];
                    const latest = algoPreds[0];
                    return (
                        <div className="stat-card" key={key} style={{ borderRight: `4px solid ${algorithmColors[key]}` }}>
                            <div style={{ fontSize: '28px', marginBottom: '8px' }}>{algorithmIcons[key]}</div>
                            <div className="stat-label">{name}</div>
                            <div className="stat-number" style={{ fontSize: '22px', color: algorithmColors[key] }}>
                                {latest ? `${latest.predictedConsumption?.toFixed(1)} מ״ק` : '-'}
                            </div>
                            {latest?.confidence && (
                                <div style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '4px' }}>
                                    ביטחון: {latest.confidence.toFixed(0)}%
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Comparison Chart */}
            {comparisonData && (
                <div className="card" style={{ marginBottom: '20px' }}><div className="card-body">
                    <h3 style={{ marginBottom: '16px' }}>📊 השוואת אלגוריתמים</h3>
                    <div className="chart-container">
                        <Bar data={comparisonData} options={{
                            responsive: true, maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                            scales: { y: { beginAtZero: true, title: { display: true, text: 'מ״ק' } } }
                        }} />
                    </div>
                </div></div>
            )}

            {/* Predictions History */}
            <div className="card"><div className="card-body">
                <h3 style={{ marginBottom: '16px' }}>📋 היסטוריית תחזיות</h3>
                {predictions.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🤖</div>
                        <h3>אין תחזיות</h3>
                        <p>לחץ "צור תחזיות" להפעלת מודלי AI</p>
                    </div>
                ) : (
                    <div className="table-container"><table>
                        <thead><tr><th>תאריך</th><th>אלגוריתם</th><th>תחזית (מ״ק)</th><th>ביטחון</th><th>ET₀</th></tr></thead>
                        <tbody>
                            {predictions.slice(0, 20).map(p => (
                                <tr key={p._id}>
                                    <td>{new Date(p.predictionDate || p.createdAt).toLocaleDateString('he-IL')}</td>
                                    <td>
                                        <span className="badge" style={{ background: algorithmColors[p.algorithm] || '#94a3b8', color: 'white' }}>
                                            {algorithmNames[p.algorithm] || p.algorithm}
                                        </span>
                                    </td>
                                    <td><strong>{p.predictedConsumption?.toFixed(2)}</strong></td>
                                    <td>
                                        {p.confidence ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ flex: 1, height: '6px', background: 'var(--bg-secondary)', borderRadius: '3px', maxWidth: '80px' }}>
                                                    <div style={{ width: `${p.confidence}%`, height: '100%', background: p.confidence > 70 ? '#10b981' : p.confidence > 40 ? '#f59e0b' : '#ef4444', borderRadius: '3px' }} />
                                                </div>
                                                <span style={{ fontSize: '12px' }}>{p.confidence.toFixed(0)}%</span>
                                            </div>
                                        ) : '-'}
                                    </td>
                                    <td>{p.features?.et0?.toFixed(2) || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table></div>
                )}
            </div></div>
        </div>
    );
};

export default Predictions;
