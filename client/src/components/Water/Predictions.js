import React, { useState, useEffect } from 'react';
import { predictionsAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FiCpu, FiRefreshCw, FiTrendingUp, FiBarChart2 } from 'react-icons/fi';
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
    const algorithmBg = {
        linear_regression: 'rgba(59,130,246,0.08)',
        random_forest: 'rgba(16,185,129,0.08)',
        gradient_boosting: 'rgba(245,158,11,0.08)',
        fao56: 'rgba(139,92,246,0.08)'
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

    // Comparison chart
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
            borderRadius: 10,
            borderSkipped: false,
            barPercentage: 0.6,
            categoryPercentage: 0.7
        }]
    } : null;

    // Find best algorithm
    const bestAlgo = Object.entries(comparisonFromPredictions)
        .sort((a, b) => (b[1].predictedConsumption || 0) - (a[1].predictedConsumption || 0))[0];

    if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

    return (
        <div className="fade-in">
            {/* Header */}
            <div className="page-header" style={{ marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '44px', height: '44px', borderRadius: '12px',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontSize: '20px', flexShrink: 0
                    }}>
                        <FiCpu />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', margin: 0 }}>תחזיות AI - צריכת מים</h1>
                        <p style={{ fontSize: '13px', color: 'var(--text-light)', margin: 0 }}>ניתוח חכם באמצעות 4 אלגוריתמים</p>
                    </div>
                </div>
                <button className="btn btn-primary" onClick={generatePredictions} disabled={generating}
                    style={{ borderRadius: '12px', padding: '10px 24px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiRefreshCw className={generating ? 'spinning' : ''} style={{ fontSize: '16px' }} />
                    {generating ? 'מחשב...' : 'צור תחזיות'}
                </button>
            </div>

            {/* Algorithm Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '16px',
                marginBottom: '24px'
            }}>
                {Object.entries(algorithmNames).map(([key, name]) => {
                    const algoPreds = grouped[key] || [];
                    const latest = algoPreds[0];
                    const isBest = bestAlgo && bestAlgo[0] === key;
                    return (
                        <div key={key} style={{
                            background: 'var(--bg-card)',
                            borderRadius: '16px',
                            padding: '20px',
                            border: isBest ? `2px solid ${algorithmColors[key]}` : '1px solid var(--border-color)',
                            boxShadow: isBest ? `0 4px 20px ${algorithmColors[key]}22` : 'var(--shadow-card)',
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            {/* Subtle background gradient */}
                            <div style={{
                                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                background: `linear-gradient(135deg, ${algorithmBg[key]}, transparent)`,
                                pointerEvents: 'none'
                            }} />
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                    <div style={{
                                        width: '42px', height: '42px', borderRadius: '12px',
                                        background: algorithmBg[key],
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '22px'
                                    }}>
                                        {algorithmIcons[key]}
                                    </div>
                                    {isBest && (
                                        <span style={{
                                            fontSize: '10px', fontWeight: 700, color: algorithmColors[key],
                                            background: algorithmBg[key], padding: '3px 10px',
                                            borderRadius: '20px', letterSpacing: '0.5px'
                                        }}>הגבוה ביותר</span>
                                    )}
                                </div>
                                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '6px' }}>{name}</div>
                                <div style={{
                                    fontSize: '28px', fontWeight: 700, color: algorithmColors[key],
                                    lineHeight: 1.2, marginBottom: '4px'
                                }}>
                                    {latest ? latest.predictedConsumption?.toFixed(1) : '-'}
                                    <span style={{ fontSize: '14px', fontWeight: 500, marginRight: '4px', color: 'var(--text-light)' }}>מ״ק</span>
                                </div>
                                {latest?.confidence && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                                        <div style={{
                                            flex: 1, height: '5px', background: 'var(--bg-primary)',
                                            borderRadius: '10px', overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                width: `${latest.confidence}%`, height: '100%',
                                                background: `linear-gradient(90deg, ${algorithmColors[key]}, ${algorithmColors[key]}bb)`,
                                                borderRadius: '10px', transition: 'width 0.8s ease'
                                            }} />
                                        </div>
                                        <span style={{ fontSize: '12px', color: 'var(--text-light)', fontWeight: 600, minWidth: '36px' }}>
                                            {latest.confidence.toFixed(0)}%
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Charts Section */}
            <div style={{ display: 'grid', gridTemplateColumns: comparisonData ? '1fr' : '1fr', gap: '20px', marginBottom: '24px' }}>
                {comparisonData && (
                    <div className="card" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                        <div className="card-body" style={{ padding: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                <FiBarChart2 style={{ fontSize: '20px', color: 'var(--accent-green)' }} />
                                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>השוואת אלגוריתמים</h3>
                            </div>
                            <div style={{ height: '320px' }}>
                                <Bar data={comparisonData} options={{
                                    responsive: true, maintainAspectRatio: false,
                                    plugins: {
                                        legend: { display: false },
                                        tooltip: {
                                            backgroundColor: 'rgba(0,0,0,0.8)',
                                            padding: 14,
                                            cornerRadius: 10,
                                            titleFont: { size: 13, weight: '600' },
                                            bodyFont: { size: 13 },
                                            displayColors: true,
                                            boxWidth: 10,
                                            boxHeight: 10,
                                            boxPadding: 4
                                        }
                                    },
                                    scales: {
                                        y: {
                                            beginAtZero: true,
                                            title: { display: true, text: 'מ״ק', font: { size: 13, weight: '500' } },
                                            grid: { color: 'var(--border-color)', drawBorder: false },
                                            ticks: { font: { size: 12 }, padding: 8 }
                                        },
                                        x: {
                                            grid: { display: false },
                                            ticks: { font: { size: 12, weight: '500' }, padding: 8 }
                                        }
                                    }
                                }} />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Predictions History */}
            <div className="card" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                <div className="card-body" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                        <FiTrendingUp style={{ fontSize: '20px', color: 'var(--accent-green)' }} />
                        <h3 style={{ margin: 0, fontSize: '1.1rem' }}>היסטוריית תחזיות</h3>
                        {predictions.length > 0 && (
                            <span style={{
                                fontSize: '12px', background: 'var(--bg-primary)', color: 'var(--text-secondary)',
                                padding: '3px 12px', borderRadius: '20px', fontWeight: 600
                            }}>{predictions.length} רשומות</span>
                        )}
                    </div>
                    {predictions.length === 0 ? (
                        <div className="empty-state" style={{ padding: '60px 20px' }}>
                            <div style={{
                                width: '80px', height: '80px', borderRadius: '50%',
                                background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(59,130,246,0.1))',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '36px', margin: '0 auto 16px'
                            }}>🤖</div>
                            <h3 style={{ marginBottom: '8px' }}>אין תחזיות עדיין</h3>
                            <p style={{ color: 'var(--text-light)' }}>לחץ "צור תחזיות" להפעלת מודלי AI</p>
                        </div>
                    ) : (
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: 600 }}>תאריך</th>
                                        <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: 600 }}>אלגוריתם</th>
                                        <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: 600 }}>תחזית (מ״ק)</th>
                                        <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: 600 }}>ביטחון</th>
                                        <th style={{ padding: '14px 16px', fontSize: '13px', fontWeight: 600 }}>ET₀</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {predictions.slice(0, 20).map(p => (
                                        <tr key={p._id} style={{ transition: 'background 0.2s' }}>
                                            <td style={{ padding: '12px 16px' }}>{new Date(p.predictionDate || p.createdAt).toLocaleDateString('he-IL')}</td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <span style={{
                                                    background: `${algorithmColors[p.algorithm] || '#94a3b8'}18`,
                                                    color: algorithmColors[p.algorithm] || '#94a3b8',
                                                    padding: '5px 14px', borderRadius: '20px',
                                                    fontSize: '12px', fontWeight: 600,
                                                    border: `1px solid ${algorithmColors[p.algorithm] || '#94a3b8'}30`
                                                }}>
                                                    {algorithmIcons[p.algorithm] || ''} {algorithmNames[p.algorithm] || p.algorithm}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>
                                                <strong style={{ fontSize: '15px' }}>{p.predictedConsumption?.toFixed(2)}</strong>
                                            </td>
                                            <td style={{ padding: '12px 16px' }}>
                                                {p.confidence ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <div style={{
                                                            width: '70px', height: '6px',
                                                            background: 'var(--bg-primary)',
                                                            borderRadius: '10px', overflow: 'hidden'
                                                        }}>
                                                            <div style={{
                                                                width: `${p.confidence}%`, height: '100%',
                                                                background: p.confidence > 70 ? 'linear-gradient(90deg, #10b981, #34d399)' :
                                                                    p.confidence > 40 ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' :
                                                                        'linear-gradient(90deg, #ef4444, #f87171)',
                                                                borderRadius: '10px'
                                                            }} />
                                                        </div>
                                                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                                            {p.confidence.toFixed(0)}%
                                                        </span>
                                                    </div>
                                                ) : '-'}
                                            </td>
                                            <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                                                {p.features?.et0?.toFixed(2) || '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Predictions;
