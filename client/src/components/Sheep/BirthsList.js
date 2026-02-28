import React, { useState, useEffect } from 'react';
import { birthsAPI, sheepAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FiPlus, FiTrash2, FiX } from 'react-icons/fi';

const BirthsList = () => {
    const [births, setBirths] = useState([]);
    const [sheepList, setSheepList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [fd, setFd] = useState({ motherId: '', fatherId: '', birthDate: '', lambCount: 1, lambDetails: '', complications: '', notes: '' });

    useEffect(() => {
        Promise.all([
            birthsAPI.getAll(),
            sheepAPI.getAll()
        ]).then(([br, sr]) => {
            setBirths(br.data.data);
            setSheepList(sr.data.data);
        }).catch(() => toast.error('שגיאה')).finally(() => setLoading(false));
    }, []);

    const deleteB = async (id) => {
        if (!window.confirm('למחוק?')) return;
        try { await birthsAPI.delete(id); setBirths(births.filter(b => b._id !== id)); toast.success('נמחק'); } catch { toast.error('שגיאה'); }
    };

    const addB = async (e) => {
        e.preventDefault();
        if (!fd.motherId || !fd.birthDate) { toast.error('נא למלא שדות חובה'); return; }
        try {
            await birthsAPI.create({ ...fd, lambCount: Number(fd.lambCount) });
            toast.success('הלידה נרשמה');
            setShowModal(false);
            const r = await birthsAPI.getAll();
            setBirths(r.data.data);
        } catch { toast.error('שגיאה'); }
    };

    const ch = (e) => setFd({ ...fd, [e.target.name]: e.target.value });
    const females = sheepList.filter(s => s.gender === 'female');
    const males = sheepList.filter(s => s.gender === 'male');

    if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1>🐣 רישום לידות</h1>
                <button className="btn btn-primary" onClick={() => { setFd({ motherId: '', fatherId: '', birthDate: '', lambCount: 1, lambDetails: '', complications: '', notes: '' }); setShowModal(true); }}><FiPlus /> לידה חדשה</button>
            </div>

            {/* Stats */}
            <div className="stats-grid" style={{ marginBottom: '20px' }}>
                <div className="stat-card">
                    <div className="stat-number">{births.length}</div>
                    <div className="stat-label">סה״כ לידות</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{births.reduce((sum, b) => sum + (b.lambCount || 0), 0)}</div>
                    <div className="stat-label">סה״כ טלאים</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{births.filter(b => b.complications).length}</div>
                    <div className="stat-label">סיבוכים</div>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
                    <div className="modal" style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <h3>🐣 רשום לידה</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}><FiX /></button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={addB}>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>אם *</label>
                                        <select name="motherId" value={fd.motherId} onChange={ch} required>
                                            <option value="">בחר רחל</option>
                                            {females.map(s => <option key={s._id} value={s._id}>{s.tagNumber} {s.name ? `- ${s.name}` : ''}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>אב</label>
                                        <select name="fatherId" value={fd.fatherId} onChange={ch}>
                                            <option value="">בחר איל</option>
                                            {males.map(s => <option key={s._id} value={s._id}>{s.tagNumber} {s.name ? `- ${s.name}` : ''}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>תאריך לידה *</label>
                                        <input type="date" name="birthDate" value={fd.birthDate} onChange={ch} required />
                                    </div>
                                    <div className="form-group">
                                        <label>מספר טלאים</label>
                                        <input type="number" name="lambCount" value={fd.lambCount} onChange={ch} min="1" max="5" />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>פרטי טלאים</label>
                                    <textarea name="lambDetails" value={fd.lambDetails} onChange={ch} rows="2" placeholder="מין, משקל, מצב..." />
                                </div>
                                <div className="form-group">
                                    <label>סיבוכים</label>
                                    <textarea name="complications" value={fd.complications} onChange={ch} rows="2" />
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

            {births.length === 0 ? (
                <div className="card"><div className="empty-state">
                    <div className="empty-icon">🐣</div><h3>אין לידות רשומות</h3>
                </div></div>
            ) : (
                <div className="card"><div className="card-body card-body-compact"><div className="table-container">
                    <table>
                        <thead><tr><th>אם</th><th>אב</th><th>תאריך</th><th>טלאים</th><th>סיבוכים</th><th>פעולות</th></tr></thead>
                        <tbody>
                            {births.map(b => (
                                <tr key={b._id}>
                                    <td><strong>{b.motherId?.tagNumber || '-'}</strong> {b.motherId?.name && <span style={{ color: 'var(--text-light)' }}>({b.motherId.name})</span>}</td>
                                    <td>{b.fatherId?.tagNumber || '-'}</td>
                                    <td>{new Date(b.birthDate).toLocaleDateString('he-IL')}</td>
                                    <td><span className="badge badge-blue">{b.lambCount}</span></td>
                                    <td>{b.complications ? <span className="badge badge-red">כן</span> : <span className="badge badge-green">לא</span>}</td>
                                    <td><button className="btn-icon" onClick={() => deleteB(b._id)} style={{ color: 'var(--accent-red)' }}><FiTrash2 /></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div></div></div>
            )}
        </div>
    );
};

export default BirthsList;
