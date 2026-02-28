import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { waterAPI, predictionsAPI, anomaliesAPI } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { FiDroplet, FiAlertTriangle, FiTrendingUp, FiDollarSign, FiArrowLeft, FiArrowRight, FiActivity, FiZap } from 'react-icons/fi';
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
    const { t, language, isRTL } = useLanguage();

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
        labels: last30.map(r => new Date(r.date || r.createdAt).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US')),
        datasets: [{
            label: t('waterConsumption'),
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
    const typeLabels = { overconsumption: t('highConsumption'), underconsumption: t('lowConsumption'), high_consumption: t('highConsumption'), leak_suspected: t('leakSuspected'), sensor_error: t('sensorError') };
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
    const weekDays = [t('sunday'), t('monday'), t('tuesday'), t('wednesday'), t('thursday'), t('friday'), t('saturday')];
    const weeklyData = weekDays.map((_, i) => {
        const dayReadings = readings.filter(r => new Date(r.date || r.createdAt).getDay() === i);
        return dayReadings.length > 0 ? dayReadings.reduce((s, r) => s + (r.actualConsumption || 0), 0) / dayReadings.length : 0;
    });
    const weeklyChartData = {
        labels: weekDays,
        datasets: [{
            label: t('avgDailyConsumption'),
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

    const ArrowIcon = isRTL ? FiArrowLeft : FiArrowRight;

    return (
        <div className="fade-in">
            {/* Hero Header */}
            <div className="water-hero">
                <div className="water-hero-content">
                    <div className="water-hero-text">
                        <h1>💧 {t('smartWaterMgmt')}</h1>
                        <p>{t('aiWaterSystem')}</p>
                    </div>
                    <div className="water-hero-badge">
                        <FiZap />
                        <span>{t('aiEnabled')}</span>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="water-stats-grid">
                <div className="water-stat-card water-stat-blue">
                    <div className="water-stat-icon"><FiDroplet /></div>
                    <div className="water-stat-info">
                        <div className="water-stat-number">{totalConsumption.toLocaleString()}</div>
                        <div className="water-stat-label">{t('totalConsumption')}</div>
                    </div>
                    <div className="water-stat-mini">
                        <span>{t('minimum')}: {minConsumption.toFixed(1)}</span>
                        <span>{t('maximum')}: {maxConsumption.toFixed(1)}</span>
                    </div>
                </div>
                <div className="water-stat-card water-stat-green">
                    <div className="water-stat-icon"><FiTrendingUp /></div>
                    <div className="water-stat-info">
                        <div className="water-stat-number">{avgConsumption}</div>
                        <div className="water-stat-label">{t('avgPerReading')}</div>
                    </div>
                    <div className="water-stat-mini">
                        <span>{readings.length} {t('readings')}</span>
                    </div>
                </div>
                <div className="water-stat-card water-stat-red">
                    <div className="water-stat-icon"><FiAlertTriangle /></div>
                    <div className="water-stat-info">
                        <div className="water-stat-number">{unresolvedAnomalies}</div>
                        <div className="water-stat-label">{t('openAnomaliesCount')}</div>
                    </div>
                    <div className="water-stat-mini">
                        <span>{t('outOf')} {anomalies.length} {t('total')}</span>
                    </div>
                </div>
                <div className="water-stat-card water-stat-emerald">
                    <div className="water-stat-icon"><FiDollarSign /></div>
                    <div className="water-stat-info">
                        <div className="water-stat-number">₪{estimatedSavings.toLocaleString()}</div>
                        <div className="water-stat-label">{t('expectedSavings')}</div>
                    </div>
                    <div className="water-stat-mini">
                        <span>{t('withAIPredictions')}</span>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="water-charts-grid">
                <div className="water-chart-card water-chart-main">
                    <div className="water-chart-header">
                        <div>
                            <h3>📈 {t('waterTrend')}</h3>
                            <p>{t('last30Readings')}</p>
                        </div>
                        <Link to="/water/readings" className="btn btn-sm btn-secondary">
                            {t('allReadings')} <ArrowIcon />
                        </Link>
                    </div>
                    <div className="chart-container">
                        {readings.length > 0 ? (
                            <Line data={trendData} options={{
                                responsive: true, maintainAspectRatio: false,
                                plugins: { legend: { display: false }, tooltip: { backgroundColor: 'rgba(0,0,0,0.8)', padding: 12, cornerRadius: 8, titleFont: { family: 'Rubik' }, bodyFont: { family: 'Rubik' } } },
                                scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } }, x: { grid: { display: false } } }
                            }} />
                        ) : <div className="empty-state"><p>{t('noData')}</p></div>}
                    </div>
                </div>
                <div className="water-chart-card">
                    <div className="water-chart-header">
                        <div>
                            <h3>🔍 {t('anomalyDistribution')}</h3>
                            <p>{anomalies.length} {t('anomaliesDetected')}</p>
                        </div>
                    </div>
                    <div className="chart-container" style={{ height: '250px' }}>
                        {anomalies.length > 0 ? (
                            <Doughnut data={anomalyData} options={{
                                responsive: true, maintainAspectRatio: false,
                                cutout: '65%',
                                plugins: { legend: { position: 'bottom', rtl: true, labels: { padding: 16, usePointStyle: true, pointStyle: 'circle', font: { family: 'Rubik', size: 12 } } } }
                            }} />
                        ) : <div className="empty-state"><p>{t('noAnomalies')}</p></div>}
                    </div>
                </div>
            </div>

            {/* Weekly Pattern + AI Insight */}
            <div className="water-charts-grid" style={{ marginTop: '20px' }}>
                <div className="water-chart-card">
                    <div className="water-chart-header">
                        <div>
                            <h3>📊 {t('weeklyPattern')}</h3>
                            <p>{t('avgByDay')}</p>
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
                            <h3><FiActivity /> {t('aiInsights')}</h3>
                            <p>{t('autoAnalysis')}</p>
                        </div>
                    </div>
                    <div className="ai-insights-list">
                        {bestPrediction && (
                            <div className="ai-insight-item">
                                <div className="ai-insight-icon" style={{ background: 'rgba(139,92,246,0.1)', color: '#8b5cf6' }}>🤖</div>
                                <div>
                                    <strong>{t('leadingAlgo')}: {bestPrediction.algorithm}</strong>
                                    <p>{t('confidenceLevel')}: {bestPrediction.confidence?.toFixed(0)}%</p>
                                </div>
                            </div>
                        )}
                        <div className="ai-insight-item">
                            <div className="ai-insight-icon" style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>💧</div>
                            <div>
                                <strong>{t('avgConsumption')}: {avgConsumption} {t('cubicMeters')}</strong>
                                <p>{readings.length} {t('analyzedReadings')}</p>
                            </div>
                        </div>
                        {unresolvedAnomalies > 0 && (
                            <div className="ai-insight-item">
                                <div className="ai-insight-icon" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>⚠️</div>
                                <div>
                                    <strong>{unresolvedAnomalies} {t('anomaliesNeedAttention')}</strong>
                                    <p>{t('checkAnomalies')}</p>
                                </div>
                            </div>
                        )}
                        <div className="ai-insight-item">
                            <div className="ai-insight-icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>💰</div>
                            <div>
                                <strong>{t('potentialSavings')}: ₪{estimatedSavings.toLocaleString()}</strong>
                                <p>{t('basedOnAI')}</p>
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
                        <h3>{t('waterReadings')}</h3>
                        <p>{t('manageReadings')}</p>
                    </div>
                    <ArrowIcon className="water-quick-arrow" />
                </Link>
                <Link to="/water/predictions" className="water-quick-card">
                    <div className="water-quick-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)' }}>🤖</div>
                    <div className="water-quick-info">
                        <h3>{t('aiPredictions')}</h3>
                        <p>{t('smartAlgorithms')}</p>
                    </div>
                    <ArrowIcon className="water-quick-arrow" />
                </Link>
                <Link to="/water/anomalies" className="water-quick-card">
                    <div className="water-quick-icon" style={{ background: unresolvedAnomalies > 0 ? 'linear-gradient(135deg, #ef4444, #f87171)' : 'linear-gradient(135deg, #10b981, #34d399)' }}>
                        {unresolvedAnomalies > 0 ? '⚠️' : '✅'}
                    </div>
                    <div className="water-quick-info">
                        <h3>{t('anomalies')}</h3>
                        <p>{unresolvedAnomalies > 0 ? `${unresolvedAnomalies} ${t('openAnomaliesText')}` : t('allOk')}</p>
                    </div>
                    <ArrowIcon className="water-quick-arrow" />
                </Link>
            </div>

            {/* Latest Predictions */}
            {latestPredictions.length > 0 && (
                <div className="water-predictions-section">
                    <div className="water-chart-header" style={{ marginBottom: '16px' }}>
                        <div>
                            <h3>🔮 {t('latestPredictions')}</h3>
                            <p>{t('aiWaterPredictions')}</p>
                        </div>
                        <Link to="/water/predictions" className="btn btn-sm btn-secondary">
                            {t('allPredictions')} <ArrowIcon />
                        </Link>
                    </div>
                    <div className="water-predictions-grid">
                        {latestPredictions.map(p => (
                            <div key={p._id} className="water-prediction-card">
                                <div className="water-prediction-algo">
                                    <span className="badge badge-purple">{p.algorithm || 'AI'}</span>
                                    <span className="water-prediction-date">{new Date(p.predictionDate || p.createdAt).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US')}</span>
                                </div>
                                <div className="water-prediction-value">{p.predictedConsumption?.toFixed(1)}<span>{t('cubicMeters')}</span></div>
                                {p.confidence && (
                                    <div className="water-prediction-confidence">
                                        <div className="confidence-bar">
                                            <div className="confidence-bar-fill" style={{ width: `${p.confidence}%`, background: p.confidence > 80 ? '#10b981' : p.confidence > 60 ? '#f59e0b' : '#ef4444' }}></div>
                                        </div>
                                        <span>{p.confidence.toFixed(0)}% {t('confidence')}</span>
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
