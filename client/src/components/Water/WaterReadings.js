import React, { useState, useEffect } from 'react';
import { waterAPI, fieldsAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FiPlus, FiTrash2, FiDroplet, FiX, FiZap, FiThermometer, FiWind, FiCloudRain, FiTrendingUp, FiTrendingDown, FiAlertTriangle, FiCheckCircle, FiInfo } from 'react-icons/fi';

const WaterReadings = () => {
    const [readings, setReadings] = useState([]);
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [suggestion, setSuggestion] = useState(null);
    const [loadingSuggestion, setLoadingSuggestion] = useState(false);
    const [fd, setFd] = useState({ source: 'manual', actualConsumption: '', date: '', fieldId: '', quality: 'good', phLevel: '', notes: '' });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [readingsRes, fieldsRes] = await Promise.all([
                waterAPI.getAll(),
                fieldsAPI.getAll()
            ]);
            setReadings(readingsRes.data.data || []);
            setFields(fieldsRes.data.data || []);
        } catch {
            toast.error('שגיאה בטעינת נתונים');
        }
        setLoading(false);
    };

    // Smart suggestion when field is selected
    const loadSmartSuggestion = async (fieldId) => {
        if (!fieldId) { setSuggestion(null); return; }
        setLoadingSuggestion(true);
        try {
            const res = await waterAPI.getSmartSuggestion(fieldId);
            setSuggestion(res.data.data);
        } catch {
            setSuggestion(null);
        }
        setLoadingSuggestion(false);
    };

    const deleteR = async (id) => {
        if (!window.confirm('למחוק את הקריאה?')) return;
        try {
            await waterAPI.delete(id);
            setReadings(readings.filter(r => r._id !== id));
            toast.success('הקריאה נמחקה');
        } catch {
            toast.error('שגיאה במחיקה');
        }
    };

    const addR = async (e) => {
        e.preventDefault();
        if (!fd.actualConsumption || !fd.date || !fd.fieldId) {
            toast.error('נא למלא כמות, תאריך ושדה');
            return;
        }
        try {
            await waterAPI.create({
                ...fd,
                actualConsumption: Number(fd.actualConsumption),
                phLevel: fd.phLevel ? Number(fd.phLevel) : undefined
            });
            toast.success('✅ הקריאה נוספה בהצלחה');
            setShowModal(false);
            setSuggestion(null);
            loadData();
        } catch {
            toast.error('שגיאה בהוספת קריאה');
        }
    };

    // Apply suggestion to the form
    const applySuggestion = () => {
        if (suggestion) {
            setFd(prev => ({ ...prev, actualConsumption: suggestion.suggestedConsumption.toString() }));
            toast.info('🤖 הכמות המומלצת הוזנה אוטומטית');
        }
    };

    const qualityMap = { good: 'תקין', fair: 'סביר', poor: 'לקוי' };
    const qualityColor = { good: 'badge-green', fair: 'badge-orange', poor: 'badge-red' };
    const ch = (e) => {
        const { name, value } = e.target;
        setFd(prev => ({ ...prev, [name]: value }));
        if (name === 'fieldId') {
            loadSmartSuggestion(value);
        }
    };

    // Get deviation from average for a reading
    const getDeviation = (reading) => {
        const fId = reading.fieldId?._id || reading.fieldId;
        const fieldReadings = readings.filter(r => (r.fieldId?._id || r.fieldId) === fId);
        if (fieldReadings.length < 2) return null;
        const avg = fieldReadings.reduce((s, r) => s + r.actualConsumption, 0) / fieldReadings.length;
        return ((reading.actualConsumption - avg) / avg * 100).toFixed(0);
    };

    const getDeviationBadge = (deviation) => {
        if (deviation === null) return null;
        const d = parseInt(deviation);
        if (Math.abs(d) < 15) return { text: 'תקין', color: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: <FiCheckCircle /> };
        if (d > 30) return { text: `+${d}% חריגה`, color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: <FiAlertTriangle /> };
        if (d > 15) return { text: `+${d}% גבוה`, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: <FiTrendingUp /> };
        if (d < -30) return { text: `${d}% נמוך מאוד`, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', icon: <FiTrendingDown /> };
        if (d < -15) return { text: `${d}% נמוך`, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', icon: <FiTrendingDown /> };
        return null;
    };

    // Stats
    const totalConsumption = readings.reduce((s, r) => s + (r.actualConsumption || 0), 0);
    const avgConsumption = readings.length > 0 ? (totalConsumption / readings.length).toFixed(1) : 0;
    const thisMonthReadings = readings.filter(r => {
        const d = new Date(r.date || r.createdAt);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const thisMonthTotal = thisMonthReadings.reduce((s, r) => s + (r.actualConsumption || 0), 0);

    if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1><FiDroplet /> קריאות מים חכמות</h1>
                <button className="btn btn-primary" onClick={() => {
                    setFd({ source: 'manual', actualConsumption: '', date: new Date().toISOString().split('T')[0], fieldId: fields[0]?._id || '', quality: 'good', phLevel: '', notes: '' });
                    setSuggestion(null);
                    setShowModal(true);
                    if (fields[0]?._id) loadSmartSuggestion(fields[0]._id);
                }}>
                    <FiPlus /> קריאה חכמה חדשה
                </button>
            </div>

            {/* Smart Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
                    <div className="modal" style={{ maxWidth: '700px' }}>
                        <div className="modal-header">
                            <h3>💧 הוסף קריאת מים חכמה</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}><FiX /></button>
                        </div>
                        <div className="modal-body">
                            {/* AI Suggestion Banner */}
                            {loadingSuggestion && (
                                <div style={{ padding: '16px', background: 'rgba(59,130,246,0.05)', borderRadius: '12px', marginBottom: '16px', textAlign: 'center' }}>
                                    <div className="spinner" style={{ width: '24px', height: '24px', margin: '0 auto' }}></div>
                                    <p style={{ margin: '8px 0 0', fontSize: '14px', color: '#6b7280' }}>🤖 מחשב המלצה חכמה...</p>
                                </div>
                            )}
                            {suggestion && !loadingSuggestion && (
                                <div style={{ padding: '16px', background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.08))', borderRadius: '12px', marginBottom: '16px', border: '1px solid rgba(59,130,246,0.2)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <FiZap style={{ color: '#8b5cf6' }} />
                                            <strong style={{ color: '#4b5563' }}>המלצת AI</strong>
                                        </div>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-primary"
                                            onClick={applySuggestion}
                                            style={{ fontSize: '12px', padding: '4px 12px', borderRadius: '8px' }}
                                        >
                                            🤖 החל כמות מומלצת
                                        </button>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                                        <div style={{ background: 'rgba(255,255,255,0.7)', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                                            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#3b82f6' }}>{suggestion.suggestedConsumption}</div>
                                            <div style={{ fontSize: '11px', color: '#6b7280' }}>מ״ק מומלץ (ET₀×Kc)</div>
                                        </div>
                                        {suggestion.historicalAvg && (
                                            <div style={{ background: 'rgba(255,255,255,0.7)', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                                                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10b981' }}>{suggestion.historicalAvg}</div>
                                                <div style={{ fontSize: '11px', color: '#6b7280' }}>ממוצע 30 יום</div>
                                            </div>
                                        )}
                                        {suggestion.predictedConsumption && (
                                            <div style={{ background: 'rgba(255,255,255,0.7)', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                                                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#8b5cf6' }}>{suggestion.predictedConsumption.toFixed(1)}</div>
                                                <div style={{ fontSize: '11px', color: '#6b7280' }}>חיזוי AI</div>
                                            </div>
                                        )}
                                    </div>
                                    {/* Weather info */}
                                    <div style={{ display: 'flex', gap: '16px', marginTop: '10px', fontSize: '12px', color: '#6b7280', flexWrap: 'wrap' }}>
                                        <span><FiThermometer style={{ verticalAlign: 'middle' }} /> {suggestion.weather.temperature}°C</span>
                                        <span><FiDroplet style={{ verticalAlign: 'middle' }} /> לחות {suggestion.weather.humidity}%</span>
                                        <span><FiWind style={{ verticalAlign: 'middle' }} /> רוח {suggestion.weather.windSpeed?.toFixed(1)} מ/ש</span>
                                        <span><FiCloudRain style={{ verticalAlign: 'middle' }} /> גשם {suggestion.weather.rainfall} מ״מ</span>
                                    </div>
                                    {suggestion.tip && (
                                        <div style={{ marginTop: '8px', fontSize: '12px', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <FiInfo style={{ color: '#f59e0b' }} />
                                            <em>{suggestion.tip}</em>
                                        </div>
                                    )}
                                    {suggestion.crop && (
                                        <div style={{ marginTop: '6px', fontSize: '11px', color: '#6b7280' }}>
                                            🌱 גידול: {suggestion.crop.type} | שלב: {suggestion.crop.stage} | ET₀: {suggestion.et0} | Kc: {suggestion.kc}
                                        </div>
                                    )}
                                </div>
                            )}

                            <form onSubmit={addR}>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>שדה *</label>
                                        <select name="fieldId" value={fd.fieldId} onChange={ch} required>
                                            <option value="">בחר שדה...</option>
                                            {fields.map(f => (
                                                <option key={f._id} value={f._id}>{f.name} ({f.size} {f.sizeUnit || 'דונם'})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>כמות (מ״ק) *</label>
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                type="number"
                                                name="actualConsumption"
                                                value={fd.actualConsumption}
                                                onChange={ch}
                                                required
                                                min="0"
                                                step="0.1"
                                                style={suggestion && fd.actualConsumption ? {
                                                    borderColor: Math.abs(Number(fd.actualConsumption) - suggestion.suggestedConsumption) / suggestion.suggestedConsumption > 0.3 ? '#ef4444' :
                                                        Math.abs(Number(fd.actualConsumption) - suggestion.suggestedConsumption) / suggestion.suggestedConsumption > 0.15 ? '#f59e0b' : '#10b981'
                                                } : {}}
                                            />
                                            {suggestion && fd.actualConsumption && (
                                                <div style={{
                                                    fontSize: '11px', marginTop: '4px',
                                                    color: Math.abs(Number(fd.actualConsumption) - suggestion.suggestedConsumption) / suggestion.suggestedConsumption > 0.3 ? '#ef4444' :
                                                        Math.abs(Number(fd.actualConsumption) - suggestion.suggestedConsumption) / suggestion.suggestedConsumption > 0.15 ? '#f59e0b' : '#10b981'
                                                }}>
                                                    {(() => {
                                                        const diff = ((Number(fd.actualConsumption) - suggestion.suggestedConsumption) / suggestion.suggestedConsumption * 100).toFixed(0);
                                                        if (Math.abs(diff) < 15) return `✅ קרוב להמלצה (${diff > 0 ? '+' : ''}${diff}%)`;
                                                        if (diff > 30) return `⚠️ חריגה משמעותית (+${diff}% מהמומלץ)`;
                                                        if (diff > 0) return `⬆️ מעל המומלץ (+${diff}%)`;
                                                        return `⬇️ מתחת למומלץ (${diff}%)`;
                                                    })()}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>תאריך *</label>
                                        <input type="date" name="date" value={fd.date} onChange={ch} required />
                                    </div>
                                    <div className="form-group">
                                        <label>מקור</label>
                                        <select name="source" value={fd.source} onChange={ch}>
                                            <option value="manual">ידני</option>
                                            <option value="sensor">חיישן</option>
                                            <option value="meter">מונה</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>איכות</label>
                                        <select name="quality" value={fd.quality} onChange={ch}>
                                            <option value="good">תקין</option>
                                            <option value="fair">סביר</option>
                                            <option value="poor">לקוי</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>pH</label>
                                        <input type="number" name="phLevel" value={fd.phLevel} onChange={ch} min="0" max="14" step="0.1" />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>הערות</label>
                                    <textarea name="notes" value={fd.notes} onChange={ch} rows="2" />
                                </div>
                                <div className="form-actions">
                                    <button type="submit" className="btn btn-primary">💾 שמור קריאה</button>
                                    {suggestion && (
                                        <button type="button" className="btn btn-secondary" onClick={applySuggestion} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <FiZap /> השתמש בהמלצת AI
                                        </button>
                                    )}
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>ביטול</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Summary Stats */}
            <div className="stats-grid" style={{ marginBottom: '20px' }}>
                <div className="stat-card">
                    <div className="stat-number">{readings.length}</div>
                    <div className="stat-label">סה״כ קריאות</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{totalConsumption.toFixed(1)}</div>
                    <div className="stat-label">סה״כ צריכה (מ״ק)</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{avgConsumption}</div>
                    <div className="stat-label">ממוצע לקריאה</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{thisMonthTotal.toFixed(1)}</div>
                    <div className="stat-label">צריכה החודש</div>
                </div>
            </div>

            {readings.length === 0 ? (
                <div className="card"><div className="empty-state">
                    <div className="empty-icon">💧</div>
                    <h3>אין קריאות מים</h3>
                    <p>הוסף קריאה חכמה - המערכת תמליץ על כמות מבוססת מזג אוויר וגידולים</p>
                    <button className="btn btn-primary" onClick={() => {
                        setFd({ source: 'manual', actualConsumption: '', date: new Date().toISOString().split('T')[0], fieldId: fields[0]?._id || '', quality: 'good', phLevel: '', notes: '' });
                        setShowModal(true);
                        if (fields[0]?._id) loadSmartSuggestion(fields[0]._id);
                    }}>
                        <FiZap /> הוסף קריאה חכמה ראשונה
                    </button>
                </div></div>
            ) : (
                <div className="card"><div className="card-body card-body-compact"><div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>תאריך</th>
                                <th>שדה</th>
                                <th>כמות (מ״ק)</th>
                                <th>סטטוס</th>
                                <th>מקור</th>
                                <th>איכות</th>
                                <th>pH</th>
                                <th>הערות</th>
                                <th>פעולות</th>
                            </tr>
                        </thead>
                        <tbody>
                            {readings.map(r => {
                                const deviation = getDeviation(r);
                                const deviationBadge = getDeviationBadge(deviation);
                                return (
                                    <tr key={r._id}>
                                        <td>{new Date(r.date || r.createdAt).toLocaleDateString('he-IL')}</td>
                                        <td>
                                            <span style={{ fontSize: '13px' }}>
                                                {r.fieldId?.name || '—'}
                                            </span>
                                        </td>
                                        <td><strong>{r.actualConsumption}</strong></td>
                                        <td>
                                            {deviationBadge ? (
                                                <span style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                    padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
                                                    color: deviationBadge.color, background: deviationBadge.bg
                                                }}>
                                                    {deviationBadge.icon} {deviationBadge.text}
                                                </span>
                                            ) : (
                                                <span style={{ fontSize: '11px', color: '#9ca3af' }}>—</span>
                                            )}
                                        </td>
                                        <td>{r.source === 'manual' ? 'ידני' : r.source === 'sensor' ? 'חיישן' : r.source === 'meter' ? 'מונה' : r.source || '—'}</td>
                                        <td><span className={`badge ${qualityColor[r.quality] || 'badge-gray'}`}>{qualityMap[r.quality] || r.quality || '—'}</span></td>
                                        <td>{r.phLevel || '—'}</td>
                                        <td>{r.notes?.substring(0, 30) || '—'}</td>
                                        <td>
                                            <button className="btn-icon" onClick={() => deleteR(r._id)} style={{ color: 'var(--accent-red)' }}>
                                                <FiTrash2 />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div></div></div>
            )}
        </div>
    );
};

export default WaterReadings;
