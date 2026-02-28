import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Line, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement,
    LineElement, Title, Tooltip, Legend, ArcElement, Filler
} from 'chart.js';
import { dashboardAPI, weatherAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import {
    FiMap, FiDroplet, FiAlertTriangle, FiTrendingUp,
    FiActivity, FiCalendar, FiChevronLeft, FiChevronRight, FiThermometer, FiWind, FiCloudRain
} from 'react-icons/fi';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler);

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const { darkMode } = useTheme();
    const { t, language, isRTL } = useLanguage();

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const [dashRes, weatherRes] = await Promise.all([
                dashboardAPI.getStats(),
                weatherAPI.getRealtime().catch(() => null)
            ]);
            setStats(dashRes.data.data);
            if (weatherRes?.data?.data) {
                setWeather(weatherRes.data.data);
            }
        } catch (err) {
            console.error('Dashboard load error:', err);
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    const textColor = darkMode ? '#e8f5e9' : '#1a2e1a';
    const gridColor = darkMode ? '#2d4a2d' : '#e0e8e0';
    const ChevronIcon = isRTL ? FiChevronLeft : FiChevronRight;

    // Weather icon mapping
    const getWeatherEmoji = (icon) => {
        if (!icon) return '🌤️';
        if (icon.includes('01')) return '☀️';
        if (icon.includes('02')) return '⛅';
        if (icon.includes('03') || icon.includes('04')) return '☁️';
        if (icon.includes('09') || icon.includes('10')) return '🌧️';
        if (icon.includes('11')) return '⛈️';
        if (icon.includes('13')) return '❄️';
        if (icon.includes('50')) return '🌫️';
        return '🌤️';
    };

    // Water trend chart
    const waterTrendData = {
        labels: stats?.water?.trend?.map(t => t.date?.substring(5)) || [],
        datasets: [{
            label: t('waterConsumption'),
            data: stats?.water?.trend?.map(t => t.value) || [],
            borderColor: '#42a5f5',
            backgroundColor: 'rgba(66, 165, 245, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 2,
            pointHoverRadius: 6,
            borderWidth: 2,
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: darkMode ? '#1e331e' : '#fff',
                titleColor: textColor,
                bodyColor: textColor,
                borderColor: gridColor,
                borderWidth: 1,
                rtl: isRTL,
                textDirection: isRTL ? 'rtl' : 'ltr',
            }
        },
        scales: {
            x: { ticks: { color: textColor, font: { size: 10 } }, grid: { color: gridColor } },
            y: { ticks: { color: textColor, font: { size: 10 } }, grid: { color: gridColor } }
        }
    };

    // Sheep health doughnut
    const sheepHealthData = {
        labels: [t('healthy'), t('sick'), t('pregnant')],
        datasets: [{
            data: [
                stats?.sheep?.healthy || 0,
                stats?.sheep?.sick || 0,
                stats?.sheep?.pregnant || 0
            ],
            backgroundColor: ['#4caf50', '#ef5350', '#ff9800'],
            borderWidth: 0,
        }]
    };

    const opTypeLabels = {
        planting: t('planting'), harvesting: t('harvesting'), fertilizing: t('fertilizing'),
        spraying: t('spraying'), irrigation: t('irrigation'), plowing: t('plowing'), weeding: t('weeding')
    };

    return (
        <div className="dashboard fade-in">
            <div className="dashboard-header">
                <h1>👋 {t('hello')}, {user?.name || t('farmer')}</h1>
                <p>{t('dashboardSummary')}</p>
            </div>

            {/* Real Weather Card */}
            {weather && (
                <div className="card" style={{ marginBottom: '20px', background: 'linear-gradient(135deg, #42a5f5 0%, #1976d2 100%)', color: '#fff', borderRadius: '16px' }}>
                    <div className="card-body" style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <span style={{ fontSize: '48px' }}>{getWeatherEmoji(weather.icon)}</span>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: '32px', fontWeight: 700, color: '#fff' }}>
                                        {weather.temperature?.toFixed(1)}°C
                                    </h2>
                                    <p style={{ margin: '4px 0 0', opacity: 0.9, fontSize: '14px' }}>
                                        {weather.city} {weather.country ? `(${weather.country})` : ''} — {weather.description}
                                    </p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <FiThermometer style={{ fontSize: '20px', opacity: 0.9 }} />
                                    <p style={{ margin: '4px 0 0', fontSize: '13px', opacity: 0.9 }}>{t('feelsLike')}</p>
                                    <strong style={{ fontSize: '16px' }}>{weather.feelsLike?.toFixed(1) || weather.temperature?.toFixed(1)}°C</strong>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <FiDroplet style={{ fontSize: '20px', opacity: 0.9 }} />
                                    <p style={{ margin: '4px 0 0', fontSize: '13px', opacity: 0.9 }}>{t('humidity')}</p>
                                    <strong style={{ fontSize: '16px' }}>{weather.humidity}%</strong>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <FiWind style={{ fontSize: '20px', opacity: 0.9 }} />
                                    <p style={{ margin: '4px 0 0', fontSize: '13px', opacity: 0.9 }}>{t('wind')}</p>
                                    <strong style={{ fontSize: '16px' }}>{weather.windSpeed?.toFixed(1)} m/s</strong>
                                </div>
                                {weather.rainfall > 0 && (
                                    <div style={{ textAlign: 'center' }}>
                                        <FiCloudRain style={{ fontSize: '20px', opacity: 0.9 }} />
                                        <p style={{ margin: '4px 0 0', fontSize: '13px', opacity: 0.9 }}>{t('rain')}</p>
                                        <strong style={{ fontSize: '16px' }}>{weather.rainfall} mm</strong>
                                    </div>
                                )}
                                <div style={{ textAlign: 'center' }}>
                                    <span style={{ fontSize: '16px', opacity: 0.9 }}>↓</span>
                                    <p style={{ margin: '4px 0 0', fontSize: '13px', opacity: 0.9 }}>Min</p>
                                    <strong style={{ fontSize: '16px' }}>{weather.temperatureMin?.toFixed(1)}°C</strong>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <span style={{ fontSize: '16px', opacity: 0.9 }}>↑</span>
                                    <p style={{ margin: '4px 0 0', fontSize: '13px', opacity: 0.9 }}>Max</p>
                                    <strong style={{ fontSize: '16px' }}>{weather.temperatureMax?.toFixed(1)}°C</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card green">
                    <div className="stat-icon green">
                        <FiMap />
                    </div>
                    <div className="stat-info">
                        <h3>{stats?.fields?.total || 0}</h3>
                        <p>{t('totalFields')}</p>
                        <span className="badge badge-green">{stats?.fields?.active || 0} {t('active')}</span>
                    </div>
                </div>

                <div className="stat-card blue">
                    <div className="stat-icon blue">
                        <FiActivity />
                    </div>
                    <div className="stat-info">
                        <h3>{stats?.crops?.total || 0}</h3>
                        <p>{t('crops')}</p>
                        <span className="badge badge-blue">{stats?.crops?.growing || 0} {t('growing')}</span>
                    </div>
                </div>

                <div className="stat-card orange">
                    <div className="stat-icon orange">🐑</div>
                    <div className="stat-info">
                        <h3>{stats?.sheep?.total || 0}</h3>
                        <p>{t('sheep')}</p>
                        <span className="badge badge-orange">{stats?.sheep?.active || 0} {t('active')}</span>
                    </div>
                </div>

                <div className="stat-card teal">
                    <div className="stat-icon teal">
                        <FiDroplet />
                    </div>
                    <div className="stat-info">
                        <h3>{stats?.water?.monthlyConsumption?.toFixed(0) || 0}</h3>
                        <p>{t('waterThisMonth')}</p>
                    </div>
                </div>

                <div className="stat-card red">
                    <div className="stat-icon red">
                        <FiAlertTriangle />
                    </div>
                    <div className="stat-info">
                        <h3>{stats?.alerts?.unresolvedAnomalies || 0}</h3>
                        <p>{t('openAnomalies')}</p>
                    </div>
                </div>

                <div className="stat-card purple">
                    <div className="stat-icon purple">
                        <FiCalendar />
                    </div>
                    <div className="stat-info">
                        <h3>{stats?.alerts?.upcomingVaccinations?.length || 0}</h3>
                        <p>{t('upcomingVacc')}</p>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="dashboard-grid">
                <div className="card">
                    <div className="card-header">
                        <h3><FiTrendingUp /> {t('waterTrend30')}</h3>
                        <Link to="/water" className="btn btn-sm btn-secondary">
                            {t('details')} <ChevronIcon />
                        </Link>
                    </div>
                    <div className="card-body">
                        <div className="chart-container">
                            <Line data={waterTrendData} options={chartOptions} />
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3>🐑 {t('flockHealth')}</h3>
                        <Link to="/sheep" className="btn btn-sm btn-secondary">
                            {t('details')} <ChevronIcon />
                        </Link>
                    </div>
                    <div className="card-body">
                        <div className="chart-container" style={{ height: '250px' }}>
                            <Doughnut data={sheepHealthData} options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        position: 'bottom',
                                        rtl: isRTL,
                                        labels: { color: textColor, font: { family: 'Rubik' }, padding: 16 }
                                    }
                                }
                            }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Grid - Alerts & Recent Activity */}
            <div className="dashboard-grid">
                <div className="card">
                    <div className="card-header">
                        <h3>📋 {t('recentOps')}</h3>
                        <Link to="/operations" className="btn btn-sm btn-secondary">
                            {t('all')} <ChevronIcon />
                        </Link>
                    </div>
                    <div className="card-body card-body-compact">
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>{t('date')}</th>
                                        <th>{t('field')}</th>
                                        <th>{t('opType')}</th>
                                        <th>{t('status')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats?.recentActivity?.operations?.length > 0 ? (
                                        stats.recentActivity.operations.map((op, i) => (
                                            <tr key={i}>
                                                <td>{new Date(op.date).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US')}</td>
                                                <td>{op.fieldId?.name || '-'}</td>
                                                <td>
                                                    <span className={`badge ${op.operationType === 'planting' ? 'badge-green' :
                                                        op.operationType === 'harvesting' ? 'badge-orange' :
                                                            op.operationType === 'fertilizing' ? 'badge-purple' :
                                                                op.operationType === 'spraying' ? 'badge-red' : 'badge-blue'
                                                        }`}>
                                                        {opTypeLabels[op.operationType] || op.operationType}
                                                    </span>
                                                </td>
                                                <td><span className="badge badge-gray">{op.status === 'completed' ? t('completed') : op.status}</span></td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-light)' }}>{t('noRecentOps')}</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3>🔔 {t('alerts')}</h3>
                    </div>
                    <div className="card-body">
                        {stats?.alerts?.upcomingVaccinations?.length > 0 ? (
                            stats.alerts.upcomingVaccinations.map((v, i) => (
                                <div className="alert-item" key={i}>
                                    <div className="alert-dot orange"></div>
                                    <div className="alert-content">
                                        <h4>{t('upcomingVaccAlert')}: {v.vaccineName}</h4>
                                        <p>{t('sheepTag')} {v.sheepId?.tagNumber} - {new Date(v.nextDueDate).toLocaleDateString(language === 'he' ? 'he-IL' : 'en-US')}</p>
                                    </div>
                                </div>
                            ))
                        ) : null}

                        {stats?.sheep?.sick > 0 && (
                            <div className="alert-item">
                                <div className="alert-dot red"></div>
                                <div className="alert-content">
                                    <h4>{stats.sheep.sick} {t('sickSheep')}</h4>
                                    <p>{t('sickSheepDesc')}</p>
                                </div>
                            </div>
                        )}

                        {stats?.alerts?.unresolvedAnomalies > 0 && (
                            <div className="alert-item">
                                <div className="alert-dot red"></div>
                                <div className="alert-content">
                                    <h4>{stats.alerts.unresolvedAnomalies} {t('waterAnomalies')}</h4>
                                    <p>{t('waterAnomaliesDesc')}</p>
                                </div>
                            </div>
                        )}

                        {stats?.sheep?.pregnant > 0 && (
                            <div className="alert-item">
                                <div className="alert-dot blue"></div>
                                <div className="alert-content">
                                    <h4>{stats.sheep.pregnant} {t('pregnantSheep')}</h4>
                                    <p>{t('pregnantDesc')}</p>
                                </div>
                            </div>
                        )}

                        {!stats?.alerts?.upcomingVaccinations?.length && !stats?.sheep?.sick && !stats?.alerts?.unresolvedAnomalies && (
                            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-light)' }}>
                                <p>✅ {t('noAlerts')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
