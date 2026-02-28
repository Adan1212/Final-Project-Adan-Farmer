import React, { useState, useEffect } from 'react';
import { waterAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FiPlus, FiTrash2, FiDroplet, FiX } from 'react-icons/fi';

const WaterReadings = () => {
    const [readings, setReadings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [fd, setFd] = useState({ source: 'manual', actualConsumption: '', date: '', fieldId: '', quality: 'good', phLevel: '', notes: '' });

    useEffect(() => { loadReadings(); }, []);

    const loadReadings = async () => {
        try { const r = await waterAPI.getAll(); setReadings(r.data.data || []); } catch { toast.error('שגיאה'); }
        setLoading(false);
    };

    const deleteR = async (id) => {
        if (!window.confirm('למחוק?')) return;
        try { await waterAPI.delete(id); setReadings(readings.filter(r => r._id !== id)); toast.success('נמחק'); } catch { toast.error('שגיאה'); }
    };

    const addR = async (e) => {
        e.preventDefault();
        if (!fd.actualConsumption || !fd.date) { toast.error('נא למלא שדות חובה'); return; }
        try {
            await waterAPI.create({ ...fd, actualConsumption: Number(fd.actualConsumption), phLevel: fd.phLevel ? Number(fd.phLevel) : undefined });
            toast.success('הקריאה נוספה');
            setShowModal(false);
            loadReadings();
        } catch { toast.error('שגיאה'); }
    };

    const qualityMap = { good: 'תקין', fair: 'סביר', poor: 'לקוי' };
    const qualityColor = { good: 'badge-green', fair: 'badge-orange', poor: 'badge-red' };
    const ch = (e) => setFd({ ...fd, [e.target.name]: e.target.value });

    if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1><FiDroplet /> קריאות מים</h1>
                <button className="btn btn-primary" onClick={() => { setFd({ source: 'manual', actualConsumption: '', date: '', fieldId: '', quality: 'good', phLevel: '', notes: '' }); setShowModal(true); }}><FiPlus /> קריאה חדשה</button>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
                    <div className="modal" style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <h3>💧 הוסף קריאת מים</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}><FiX /></button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={addR}>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>כמות (מ״ק) *</label>
                                        <input type="number" name="actualConsumption" value={fd.actualConsumption} onChange={ch} required min="0" step="0.1" />
                                    </div>
                                    <div className="form-group">
                                        <label>תאריך *</label>
                                        <input type="date" name="date" value={fd.date} onChange={ch} required />
                                    </div>
                                    <div className="form-group">
                                        <label>מקור</label>
                                        <input name="source" value={fd.source} onChange={ch} placeholder="באר, מאגר, מקורות..." />
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
                                    <button type="submit" className="btn btn-primary">שמור</button>
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>ביטול</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Summary */}
            <div className="stats-grid" style={{ marginBottom: '20px' }}>
                <div className="stat-card">
                    <div className="stat-number">{readings.length}</div>
                    <div className="stat-label">סה״כ קריאות</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{readings.reduce((s, r) => s + (r.actualConsumption || 0), 0).toFixed(1)}</div>
                    <div className="stat-label">סה״כ צריכה (מ״ק)</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{readings.length > 0 ? (readings.reduce((s, r) => s + (r.actualConsumption || 0), 0) / readings.length).toFixed(1) : 0}</div>
                    <div className="stat-label">ממוצע לקריאה</div>
                </div>
            </div>

            {readings.length === 0 ? (
                <div className="card"><div className="empty-state">
                    <div className="empty-icon">💧</div><h3>אין קריאות מים</h3><p>הוסף קריאות מונים</p>
                </div></div>
            ) : (
                <div className="card"><div className="card-body card-body-compact"><div className="table-container">
                    <table>
                        <thead><tr><th>תאריך</th><th>כמות (מ״ק)</th><th>מקור</th><th>איכות</th><th>pH</th><th>הערות</th><th>פעולות</th></tr></thead>
                        <tbody>
                            {readings.map(r => (
                                <tr key={r._id}>
                                    <td>{new Date(r.date || r.createdAt).toLocaleDateString('he-IL')}</td>
                                    <td><strong>{r.actualConsumption}</strong></td>
                                    <td>{r.source || '-'}</td>
                                    <td><span className={`badge ${qualityColor[r.quality] || 'badge-gray'}`}>{qualityMap[r.quality] || r.quality || '-'}</span></td>
                                    <td>{r.phLevel || '-'}</td>
                                    <td>{r.notes?.substring(0, 30) || '-'}</td>
                                    <td><button className="btn-icon" onClick={() => deleteR(r._id)} style={{ color: 'var(--accent-red)' }}><FiTrash2 /></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div></div></div>
            )}
        </div>
    );
};

export default WaterReadings;
