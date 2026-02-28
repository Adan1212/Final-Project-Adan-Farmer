import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Line, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement,
    LineElement, Title, Tooltip, Legend, ArcElement, Filler
} from 'chart.js';
import { dashboardAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
    FiMap, FiDroplet, FiAlertTriangle, FiTrendingUp,
    FiActivity, FiCalendar, FiChevronLeft
} from 'react-icons/fi';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, Filler);

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const { darkMode } = useTheme();

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const res = await dashboardAPI.getStats();
            setStats(res.data.data);
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

    // Water trend chart
    const waterTrendData = {
        labels: stats?.water?.trend?.map(t => t.date?.substring(5)) || [],
        datasets: [{
            label: 'צריכת מים (מ״ק)',
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
                rtl: true,
                textDirection: 'rtl',
            }
        },
        scales: {
            x: { ticks: { color: textColor, font: { size: 10 } }, grid: { color: gridColor } },
            y: { ticks: { color: textColor, font: { size: 10 } }, grid: { color: gridColor } }
        }
    };

    // Sheep health doughnut
    const sheepHealthData = {
        labels: ['בריאים', 'חולים', 'בהריון'],
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

    return (
        <div className="dashboard fade-in">
            <div className="dashboard-header">
                <h1>👋 שלום, {user?.name || 'חקלאי'}</h1>
                <p>הנה סיכום המצב בחווה שלך היום</p>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card green">
                    <div className="stat-icon green">
                        <FiMap />
                    </div>
                    <div className="stat-info">
                        <h3>{stats?.fields?.total || 0}</h3>
                        <p>שדות</p>
                        <span className="badge badge-green">{stats?.fields?.active || 0} פעילים</span>
                    </div>
                </div>

                <div className="stat-card blue">
                    <div className="stat-icon blue">
                        <FiActivity />
                    </div>
                    <div className="stat-info">
                        <h3>{stats?.crops?.total || 0}</h3>
                        <p>גידולים</p>
                        <span className="badge badge-blue">{stats?.crops?.growing || 0} בצמיחה</span>
                    </div>
                </div>

                <div className="stat-card orange">
                    <div className="stat-icon orange">🐑</div>
                    <div className="stat-info">
                        <h3>{stats?.sheep?.total || 0}</h3>
                        <p>כבשים</p>
                        <span className="badge badge-orange">{stats?.sheep?.active || 0} פעילים</span>
                    </div>
                </div>

                <div className="stat-card teal">
                    <div className="stat-icon teal">
                        <FiDroplet />
                    </div>
                    <div className="stat-info">
                        <h3>{stats?.water?.monthlyConsumption?.toFixed(0) || 0}</h3>
                        <p>מ״ק מים החודש</p>
                    </div>
                </div>

                <div className="stat-card red">
                    <div className="stat-icon red">
                        <FiAlertTriangle />
                    </div>
                    <div className="stat-info">
                        <h3>{stats?.alerts?.unresolvedAnomalies || 0}</h3>
                        <p>חריגות פתוחות</p>
                    </div>
                </div>

                <div className="stat-card purple">
                    <div className="stat-icon purple">
                        <FiCalendar />
                    </div>
                    <div className="stat-info">
                        <h3>{stats?.alerts?.upcomingVaccinations?.length || 0}</h3>
                        <p>חיסונים קרובים</p>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="dashboard-grid">
                <div className="card">
                    <div className="card-header">
                        <h3><FiTrendingUp /> מגמת צריכת מים (30 יום אחרונים)</h3>
                        <Link to="/water" className="btn btn-sm btn-secondary">
                            פרטים <FiChevronLeft />
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
                        <h3>🐑 מצב בריאות העדר</h3>
                        <Link to="/sheep" className="btn btn-sm btn-secondary">
                            פרטים <FiChevronLeft />
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
                                        rtl: true,
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
                        <h3>📋 פעולות אחרונות</h3>
                        <Link to="/operations" className="btn btn-sm btn-secondary">
                            הכל <FiChevronLeft />
                        </Link>
                    </div>
                    <div className="card-body card-body-compact">
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>תאריך</th>
                                        <th>שדה</th>
                                        <th>סוג פעולה</th>
                                        <th>סטטוס</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats?.recentActivity?.operations?.length > 0 ? (
                                        stats.recentActivity.operations.map((op, i) => (
                                            <tr key={i}>
                                                <td>{new Date(op.date).toLocaleDateString('he-IL')}</td>
                                                <td>{op.fieldId?.name || '-'}</td>
                                                <td>
                                                    <span className={`badge ${op.operationType === 'planting' ? 'badge-green' :
                                                            op.operationType === 'harvesting' ? 'badge-orange' :
                                                                op.operationType === 'fertilizing' ? 'badge-purple' :
                                                                    op.operationType === 'spraying' ? 'badge-red' : 'badge-blue'
                                                        }`}>
                                                        {{ planting: 'שתילה', harvesting: 'קציר', fertilizing: 'דישון', spraying: 'ריסוס', irrigation: 'השקיה', plowing: 'חרישה', weeding: 'ניכוש' }[op.operationType] || op.operationType}
                                                    </span>
                                                </td>
                                                <td><span className="badge badge-gray">{op.status === 'completed' ? 'הושלם' : op.status}</span></td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-light)' }}>אין פעולות אחרונות</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3>🔔 התראות</h3>
                    </div>
                    <div className="card-body">
                        {stats?.alerts?.upcomingVaccinations?.length > 0 ? (
                            stats.alerts.upcomingVaccinations.map((v, i) => (
                                <div className="alert-item" key={i}>
                                    <div className="alert-dot orange"></div>
                                    <div className="alert-content">
                                        <h4>חיסון קרוב: {v.vaccineName}</h4>
                                        <p>כבש {v.sheepId?.tagNumber} - {new Date(v.nextDueDate).toLocaleDateString('he-IL')}</p>
                                    </div>
                                </div>
                            ))
                        ) : null}

                        {stats?.sheep?.sick > 0 && (
                            <div className="alert-item">
                                <div className="alert-dot red"></div>
                                <div className="alert-content">
                                    <h4>{stats.sheep.sick} כבשים חולים</h4>
                                    <p>דורשים טיפול וביקורת וטרינרית</p>
                                </div>
                            </div>
                        )}

                        {stats?.alerts?.unresolvedAnomalies > 0 && (
                            <div className="alert-item">
                                <div className="alert-dot red"></div>
                                <div className="alert-content">
                                    <h4>{stats.alerts.unresolvedAnomalies} חריגות מים</h4>
                                    <p>נדרשת בדיקה של צריכת מים חריגה</p>
                                </div>
                            </div>
                        )}

                        {stats?.sheep?.pregnant > 0 && (
                            <div className="alert-item">
                                <div className="alert-dot blue"></div>
                                <div className="alert-content">
                                    <h4>{stats.sheep.pregnant} כבשים בהריון</h4>
                                    <p>מעקב שוטף נדרש</p>
                                </div>
                            </div>
                        )}

                        {!stats?.alerts?.upcomingVaccinations?.length && !stats?.sheep?.sick && !stats?.alerts?.unresolvedAnomalies && (
                            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-light)' }}>
                                <p>✅ אין התראות חדשות</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
