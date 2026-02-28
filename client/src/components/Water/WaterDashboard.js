import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { waterAPI, predictionsAPI, anomaliesAPI } from '../../services/api';
import { FiDroplet, FiAlertTriangle, FiTrendingUp, FiDollarSign, FiArrowLeft, FiActivity, FiZap } from 'react-icons/fi';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement,
    LineElement, BarElement, Title, Tooltip, Legend, Filler, ArcElement
} from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler, ArcElement);

const WaterDashboard = () => {
    const [readings, setReadings] = useState([]);
    const [predictions, setPredictions] = useState([]);
    const [anomalies, setAnomalies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            waterAPI.getAll().catch(() => ({ data: { data: [] } })),
            predictionsAPI.getAll().catch(() => ({ data: { data: [] } })),
            anomaliesAPI.getAll().catch(() => ({ data: { data: [] } }))
        ]).then(([wr, pr, ar]) => {
            setReadings(wr.data.data || []);
            setPredictions(pr.data.data || []);
            setAnomalies(ar.data.data || []);
        }).finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

    const totalConsumption = readings.reduce((sum, r) => sum + (r.actualConsumption || 0), 0);
    const avgConsumption = readings.length > 0 ? (totalConsumption / readings.length).toFixed(1) : 0;
    const unresolvedAnomalies = anomalies.filter(a => !a.resolved).length;
    const latestPredictions = predictions.slice(0, 5);
    const maxConsumption = Math.max(...readings.map(r => r.actualConsumption || 0), 1);
    const minConsumption = readings.length > 0 ? Math.min(...readings.map(r => r.actualConsumption || 0)) : 0;

    // Water trend chart
    const last30 = readings.slice(-30);
    const trendData = {
        labels: last30.map(r => new Date(r.date || r.createdAt).toLocaleDateString('he-IL')),
        datasets: [{
            label: 'צריכת מים (מ״ק)',
            data: last30.map(r => r.actualConsumption),
            borderColor: '#3b82f6',
            backgroundColor: (ctx) => {
                const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 300);
                gradient.addColorStop(0, 'rgba(59,130,246,0.3)');
                gradient.addColorStop(1, 'rgba(59,130,246,0.02)');
                return gradient;
            },
            fill: true, tension: 0.4,
            pointBackgroundColor: '#3b82f6',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
        }]
    };

    // Anomaly distribution
    const anomalyTypes = anomalies.reduce((acc, a) => {
        const type = a.type || 'unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {});
    const typeLabels = { overconsumption: 'צריכה גבוהה', underconsumption: 'צריכה נמוכה', high_consumption: 'צריכה גבוהה', leak_suspected: 'חשד לדליפה', sensor_error: 'שגיאת חיישן' };
    const anomalyData = {
        labels: Object.keys(anomalyTypes).map(t => typeLabels[t] || t),
        datasets: [{
            data: Object.values(anomalyTypes),
            backgroundColor: ['#ef4444', '#f59e0b', '#8b5cf6', '#06b6d4', '#10b981'],
            borderWidth: 0,
            hoverOffset: 8
        }]
    };

    // Weekly consumption bar chart
    const weekDays = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
    const weeklyData = weekDays.map((_, i) => {
        const dayReadings = readings.filter(r => new Date(r.date || r.createdAt).getDay() === i);
        return dayReadings.length > 0 ? dayReadings.reduce((s, r) => s + (r.actualConsumption || 0), 0) / dayReadings.length : 0;
    });
    const weeklyChartData = {
        labels: weekDays,
        datasets: [{
            label: 'ממוצע צריכה יומית',
            data: weeklyData,
            backgroundColor: weeklyData.map(v => v > (totalConsumption / Math.max(readings.length, 1)) * 1.2 ? 'rgba(239,68,68,0.7)' : 'rgba(59,130,246,0.7)'),
            borderRadius: 8,
            borderSkipped: false
        }]
    };

    // Estimated savings
    const estimatedSavings = predictions.length > 0
        ? Math.round(predictions.reduce((sum, p) => sum + (p.potentialSaving || 0), 0))
        : Math.round(totalConsumption * 0.15);

    // Best prediction algorithm
    const bestPrediction = predictions.length > 0
        ? predictions.reduce((best, p) => (p.confidence || 0) > (best.confidence || 0) ? p : best, predictions[0])
        : null;

    return (
        <div className="fade-in">
            {/* Hero Header */}
            <div className="water-hero">
                <div className="water-hero-content">
                    <div className="water-hero-text">
                        <h1>💧 ניהול מים חכם</h1>
                        <p>מערכת AI מתקדמת לאופטימיזציה של צריכת המים בחווה</p>
                    </div>
                    <div className="water-hero-badge">
                        <FiZap />
                        <span>AI מופעל</span>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="water-stats-grid">
                <div className="water-stat-card water-stat-blue">
                    <div className="water-stat-icon"><FiDroplet /></div>
                    <div className="water-stat-info">
                        <div className="water-stat-number">{totalConsumption.toLocaleString()}</div>
                        <div className="water-stat-label">סה״כ צריכה (מ״ק)</div>
                    </div>
                    <div className="water-stat-mini">
                        <span>מינימום: {minConsumption.toFixed(1)}</span>
                        <span>מקסימום: {maxConsumption.toFixed(1)}</span>
                    </div>
                </div>
                <div className="water-stat-card water-stat-green">
                    <div className="water-stat-icon"><FiTrendingUp /></div>
                    <div className="water-stat-info">
                        <div className="water-stat-number">{avgConsumption}</div>
                        <div className="water-stat-label">ממוצע לקריאה</div>
                    </div>
                    <div className="water-stat-mini">
                        <span>{readings.length} קריאות</span>
                    </div>
                </div>
                <div className="water-stat-card water-stat-red">
                    <div className="water-stat-icon"><FiAlertTriangle /></div>
                    <div className="water-stat-info">
                        <div className="water-stat-number">{unresolvedAnomalies}</div>
                        <div className="water-stat-label">חריגות פתוחות</div>
                    </div>
                    <div className="water-stat-mini">
                        <span>מתוך {anomalies.length} סה״כ</span>
                    </div>
                </div>
                <div className="water-stat-card water-stat-emerald">
                    <div className="water-stat-icon"><FiDollarSign /></div>
                    <div className="water-stat-info">
                        <div className="water-stat-number">₪{estimatedSavings.toLocaleString()}</div>
                        <div className="water-stat-label">חיסכון צפוי</div>
                    </div>
                    <div className="water-stat-mini">
                        <span>בעזרת תחזיות AI</span>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="water-charts-grid">
                <div className="water-chart-card water-chart-main">
                    <div className="water-chart-header">
                        <div>
                            <h3>📈 מגמת צריכת מים</h3>
                            <p>30 הקריאות האחרונות</p>
                        </div>
                        <Link to="/water/readings" className="btn btn-sm btn-secondary">
                            כל הקריאות <FiArrowLeft />
                        </Link>
                    </div>
                    <div className="chart-container">
                        {readings.length > 0 ? (
                            <Line data={trendData} options={{
                                responsive: true, maintainAspectRatio: false,
                                plugins: { legend: { display: false }, tooltip: { backgroundColor: 'rgba(0,0,0,0.8)', padding: 12, cornerRadius: 8, titleFont: { family: 'Rubik' }, bodyFont: { family: 'Rubik' } } },
                                scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } }, x: { grid: { display: false } } }
                            }} />
                        ) : <div className="empty-state"><p>אין נתונים להצגה</p></div>}
                    </div>
                </div>
                <div className="water-chart-card">
                    <div className="water-chart-header">
                        <div>
                            <h3>🔍 התפלגות חריגות</h3>
                            <p>{anomalies.length} חריגות זוהו</p>
                        </div>
                    </div>
                    <div className="chart-container" style={{ height: '250px' }}>
                        {anomalies.length > 0 ? (
                            <Doughnut data={anomalyData} options={{
                                responsive: true, maintainAspectRatio: false,
                                cutout: '65%',
                                plugins: { legend: { position: 'bottom', rtl: true, labels: { padding: 16, usePointStyle: true, pointStyle: 'circle', font: { family: 'Rubik', size: 12 } } } }
                            }} />
                        ) : <div className="empty-state"><p>אין חריגות</p></div>}
                    </div>
                </div>
            </div>

            {/* Weekly Pattern + AI Insight */}
            <div className="water-charts-grid" style={{ marginTop: '20px' }}>
                <div className="water-chart-card">
                    <div className="water-chart-header">
                        <div>
                            <h3>📊 דפוס צריכה שבועי</h3>
                            <p>ממוצע צריכה לפי ימים</p>
                        </div>
                    </div>
                    <div className="chart-container" style={{ height: '250px' }}>
                        <Bar data={weeklyChartData} options={{
                            responsive: true, maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                            scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } }, x: { grid: { display: false } } }
                        }} />
                    </div>
                </div>
                <div className="water-chart-card water-ai-insight">
                    <div className="water-chart-header">
                        <div>
                            <h3><FiActivity /> תובנות AI</h3>
                            <p>ניתוח אוטומטי</p>
                        </div>
                    </div>
                    <div className="ai-insights-list">
                        {bestPrediction && (
                            <div className="ai-insight-item">
                                <div className="ai-insight-icon" style={{ background: 'rgba(139,92,246,0.1)', color: '#8b5cf6' }}>🤖</div>
                                <div>
                                    <strong>אלגוריתם מוביל: {bestPrediction.algorithm}</strong>
                                    <p>רמת ביטחון: {bestPrediction.confidence?.toFixed(0)}%</p>
                                </div>
                            </div>
                        )}
                        <div className="ai-insight-item">
                            <div className="ai-insight-icon" style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>💧</div>
                            <div>
                                <strong>ממוצע צריכה: {avgConsumption} מ״ק</strong>
                                <p>{readings.length} קריאות מנותחות</p>
                            </div>
                        </div>
                        {unresolvedAnomalies > 0 && (
                            <div className="ai-insight-item">
                                <div className="ai-insight-icon" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>⚠️</div>
                                <div>
                                    <strong>{unresolvedAnomalies} חריגות דורשות טיפול</strong>
                                    <p>יש לבדוק ולטפל בחריגות</p>
                                </div>
                            </div>
                        )}
                        <div className="ai-insight-item">
                            <div className="ai-insight-icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>💰</div>
                            <div>
                                <strong>חיסכון פוטנציאלי: ₪{estimatedSavings.toLocaleString()}</strong>
                                <p>על בסיס תחזיות AI</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Links */}
            <div className="water-quick-links">
                <Link to="/water/readings" className="water-quick-card">
                    <div className="water-quick-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #60a5fa)' }}>💧</div>
                    <div className="water-quick-info">
                        <h3>קריאות מים</h3>
                        <p>נהל קריאות מונים</p>
                    </div>
                    <FiArrowLeft className="water-quick-arrow" />
                </Link>
                <Link to="/water/predictions" className="water-quick-card">
                    <div className="water-quick-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)' }}>🤖</div>
                    <div className="water-quick-info">
                        <h3>תחזיות AI</h3>
                        <p>3 אלגוריתמים חכמים</p>
                    </div>
                    <FiArrowLeft className="water-quick-arrow" />
                </Link>
                <Link to="/water/anomalies" className="water-quick-card">
                    <div className="water-quick-icon" style={{ background: unresolvedAnomalies > 0 ? 'linear-gradient(135deg, #ef4444, #f87171)' : 'linear-gradient(135deg, #10b981, #34d399)' }}>
                        {unresolvedAnomalies > 0 ? '⚠️' : '✅'}
                    </div>
                    <div className="water-quick-info">
                        <h3>חריגות</h3>
                        <p>{unresolvedAnomalies > 0 ? `${unresolvedAnomalies} חריגות פתוחות` : 'הכל תקין!'}</p>
                    </div>
                    <FiArrowLeft className="water-quick-arrow" />
                </Link>
            </div>

            {/* Latest Predictions */}
            {latestPredictions.length > 0 && (
                <div className="water-predictions-section">
                    <div className="water-chart-header" style={{ marginBottom: '16px' }}>
                        <div>
                            <h3>🔮 תחזיות אחרונות</h3>
                            <p>תחזיות AI לצריכת מים</p>
                        </div>
                        <Link to="/water/predictions" className="btn btn-sm btn-secondary">
                            כל התחזיות <FiArrowLeft />
                        </Link>
                    </div>
                    <div className="water-predictions-grid">
                        {latestPredictions.map(p => (
                            <div key={p._id} className="water-prediction-card">
                                <div className="water-prediction-algo">
                                    <span className="badge badge-purple">{p.algorithm || 'AI'}</span>
                                    <span className="water-prediction-date">{new Date(p.predictionDate || p.createdAt).toLocaleDateString('he-IL')}</span>
                                </div>
                                <div className="water-prediction-value">{p.predictedConsumption?.toFixed(1)}<span>מ״ק</span></div>
                                {p.confidence && (
                                    <div className="water-prediction-confidence">
                                        <div className="confidence-bar">
                                            <div className="confidence-bar-fill" style={{ width: `${p.confidence}%`, background: p.confidence > 80 ? '#10b981' : p.confidence > 60 ? '#f59e0b' : '#ef4444' }}></div>
                                        </div>
                                        <span>{p.confidence.toFixed(0)}% ביטחון</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default WaterDashboard;
