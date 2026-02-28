import React, { useState, useEffect } from 'react';
import { anomaliesAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';

const Anomalies = () => {
    const [anomalies, setAnomalies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        anomaliesAPI.getAll()
            .then(r => setAnomalies(r.data.data || []))
            .catch(() => toast.error('שגיאה'))
            .finally(() => setLoading(false));
    }, []);

    const resolve = async (id) => {
        try {
            await anomaliesAPI.resolve(id);
            setAnomalies(anomalies.map(a => a._id === id ? { ...a, resolved: true, resolvedAt: new Date() } : a));
            toast.success('החריגה סומנה כטופלה');
        } catch { toast.error('שגיאה'); }
    };

    const typeMap = { overconsumption: 'צריכה גבוהה', underconsumption: 'צריכה נמוכה', high_consumption: 'צריכה גבוהה', leak_suspected: 'חשד לדליפה', sensor_error: 'שגיאת חיישן', pressure_drop: 'ירידת לחץ', unusual_pattern: 'דפוס חריג' };
    const severityMap = { low: 'נמוכה', medium: 'בינונית', high: 'גבוהה', critical: 'קריטית' };
    const severityColor = { low: 'badge-blue', medium: 'badge-orange', high: 'badge-red', critical: 'badge-red' };
    const typeIcon = { overconsumption: '📈', underconsumption: '📉', high_consumption: '📈', leak_suspected: '💧', sensor_error: '⚙️', pressure_drop: '📉', unusual_pattern: '🔍' };

    const filtered = filter === 'all' ? anomalies : filter === 'open' ? anomalies.filter(a => !a.resolved) : anomalies.filter(a => a.resolved);

    if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1><FiAlertTriangle /> זיהוי חריגות</h1>
            </div>

            {/* Stats */}
            <div className="stats-grid" style={{ marginBottom: '20px' }}>
                <div className="stat-card">
                    <div className="stat-number">{anomalies.length}</div>
                    <div className="stat-label">סה״כ חריגות</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number" style={{ color: 'var(--accent-red)' }}>{anomalies.filter(a => !a.resolved).length}</div>
                    <div className="stat-label">פתוחות</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number" style={{ color: 'var(--accent-green)' }}>{anomalies.filter(a => a.resolved).length}</div>
                    <div className="stat-label">טופלו</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number" style={{ color: 'var(--accent-orange)' }}>
                        {anomalies.filter(a => !a.resolved && (a.severity === 'high' || a.severity === 'critical')).length}
                    </div>
                    <div className="stat-label">דחופות</div>
                </div>
            </div>

            {/* Filter tabs */}
            <div className="tabs" style={{ marginBottom: '16px' }}>
                {[['all', `הכל (${anomalies.length})`], ['open', `פתוחות (${anomalies.filter(a => !a.resolved).length})`], ['resolved', `טופלו (${anomalies.filter(a => a.resolved).length})`]].map(([k, v]) => (
                    <button key={k} className={`tab ${filter === k ? 'tab-active' : ''}`} onClick={() => setFilter(k)}>{v}</button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <div className="card"><div className="empty-state">
                    <div className="empty-icon">✅</div>
                    <h3>{filter === 'open' ? 'אין חריגות פתוחות' : 'אין חריגות'}</h3>
                    <p>המערכת מנטרת באופן שוטף</p>
                </div></div>
            ) : (
                <div style={{ display: 'grid', gap: '12px' }}>
                    {filtered.map(a => (
                        <div key={a._id} className="card" style={{
                            borderRight: `4px solid ${a.resolved ? 'var(--accent-green)' : a.severity === 'critical' ? '#ef4444' : a.severity === 'high' ? '#f59e0b' : '#3b82f6'}`,
                            opacity: a.resolved ? 0.7 : 1
                        }}>
                            <div className="card-body" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                        <span style={{ fontSize: '24px' }}>{typeIcon[a.type] || '⚠️'}</span>
                                        <h3 style={{ margin: 0 }}>{typeMap[a.type] || a.type}</h3>
                                        <span className={`badge ${severityColor[a.severity] || 'badge-gray'}`}>{severityMap[a.severity] || a.severity}</span>
                                        {a.resolved && <span className="badge badge-green"><FiCheckCircle /> טופל</span>}
                                    </div>
                                    <p style={{ margin: '0 0 4px', color: 'var(--text-light)' }}>
                                        {a.description || `חריגה: צפוי ${a.expectedValue || '-'} מ״ק, בפועל ${a.actualValue || '-'} מ״ק (סטייה ${a.deviationPercent ? a.deviationPercent.toFixed(1) : '-'}%)`}
                                    </p>
                                    <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--text-light)' }}>
                                        <span>📅 {new Date(a.date || a.detectedAt || a.createdAt).toLocaleDateString('he-IL')}</span>
                                        {a.expectedValue && <span>🎯 צפוי: {a.expectedValue} מ״ק</span>}
                                        {a.actualValue && <span>📊 בפועל: {a.actualValue} מ״ק</span>}
                                        {a.resolvedAt && <span>✅ טופל: {new Date(a.resolvedAt).toLocaleDateString('he-IL')}</span>}
                                    </div>
                                </div>
                                {!a.resolved && (
                                    <button className="btn btn-primary" onClick={() => resolve(a._id)} style={{ whiteSpace: 'nowrap' }}>
                                        <FiCheckCircle /> סמן כטופל
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Anomalies;
