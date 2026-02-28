import React, { useState, useEffect } from 'react';
import { treatmentsAPI, sheepAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FiPlus, FiTrash2, FiX } from 'react-icons/fi';

const TreatmentsList = () => {
    const [treatments, setTreatments] = useState([]);
    const [sheepList, setSheepList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [fd, setFd] = useState({ sheepId: '', diagnosis: '', treatment: '', medication: '', dosage: '', date: '', status: 'ongoing', veterinarian: '', cost: 0, notes: '' });

    useEffect(() => {
        Promise.all([
            treatmentsAPI.getAll(),
            sheepAPI.getAll()
        ]).then(([tr, sr]) => {
            setTreatments(tr.data.data);
            setSheepList(sr.data.data);
        }).catch(() => toast.error('שגיאה')).finally(() => setLoading(false));
    }, []);

    const deleteT = async (id) => {
        if (!window.confirm('למחוק?')) return;
        try { await treatmentsAPI.delete(id); setTreatments(treatments.filter(t => t._id !== id)); toast.success('נמחק'); } catch { toast.error('שגיאה'); }
    };

    const addT = async (e) => {
        e.preventDefault();
        if (!fd.sheepId || !fd.diagnosis || !fd.treatment) { toast.error('נא למלא שדות חובה'); return; }
        try {
            await treatmentsAPI.create(fd);
            toast.success('הטיפול נוסף');
            setShowModal(false);
            const r = await treatmentsAPI.getAll();
            setTreatments(r.data.data);
        } catch { toast.error('שגיאה'); }
    };

    const statusMap = { ongoing: 'בטיפול', resolved: 'טופל', monitoring: 'מעקב' };
    const statusColor = { ongoing: 'badge-orange', resolved: 'badge-green', monitoring: 'badge-blue' };
    const ch = (e) => setFd({ ...fd, [e.target.name]: e.target.value });

    if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1>💊 טיפולים רפואיים</h1>
                <button className="btn btn-primary" onClick={() => { setFd({ sheepId: '', diagnosis: '', treatment: '', medication: '', dosage: '', date: '', status: 'ongoing', veterinarian: '', cost: 0, notes: '' }); setShowModal(true); }}><FiPlus /> טיפול חדש</button>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
                    <div className="modal" style={{ maxWidth: '650px' }}>
                        <div className="modal-header">
                            <h3>💊 הוסף טיפול</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}><FiX /></button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={addT}>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>כבש *</label>
                                        <select name="sheepId" value={fd.sheepId} onChange={ch} required>
                                            <option value="">בחר כבש</option>
                                            {sheepList.map(s => <option key={s._id} value={s._id}>{s.tagNumber} {s.name ? `- ${s.name}` : ''}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>אבחנה *</label>
                                        <input name="diagnosis" value={fd.diagnosis} onChange={ch} required placeholder="תיאור האבחנה..." />
                                    </div>
                                    <div className="form-group">
                                        <label>טיפול *</label>
                                        <input name="treatment" value={fd.treatment} onChange={ch} required placeholder="סוג הטיפול..." />
                                    </div>
                                    <div className="form-group">
                                        <label>תרופה</label>
                                        <input name="medication" value={fd.medication} onChange={ch} />
                                    </div>
                                    <div className="form-group">
                                        <label>מינון</label>
                                        <input name="dosage" value={fd.dosage} onChange={ch} />
                                    </div>
                                    <div className="form-group">
                                        <label>תאריך</label>
                                        <input type="date" name="date" value={fd.date} onChange={ch} />
                                    </div>
                                    <div className="form-group">
                                        <label>סטטוס</label>
                                        <select name="status" value={fd.status} onChange={ch}>
                                            {Object.entries(statusMap).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>וטרינר</label>
                                        <input name="veterinarian" value={fd.veterinarian} onChange={ch} />
                                    </div>
                                    <div className="form-group">
                                        <label>עלות (₪)</label>
                                        <input type="number" name="cost" value={fd.cost} onChange={ch} min="0" />
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

            {treatments.length === 0 ? (
                <div className="card"><div className="empty-state">
                    <div className="empty-icon">💊</div><h3>אין טיפולים</h3>
                </div></div>
            ) : (
                <div className="card"><div className="card-body card-body-compact"><div className="table-container">
                    <table>
                        <thead><tr><th>כבש</th><th>אבחנה</th><th>טיפול</th><th>תאריך</th><th>עלות</th><th>סטטוס</th><th>פעולות</th></tr></thead>
                        <tbody>
                            {treatments.map(t => (
                                <tr key={t._id}>
                                    <td><strong>{t.sheepId?.tagNumber || '-'}</strong></td>
                                    <td>{t.diagnosis}</td>
                                    <td>{t.treatment}</td>
                                    <td>{t.date ? new Date(t.date).toLocaleDateString('he-IL') : '-'}</td>
                                    <td>{t.cost ? `₪${t.cost.toLocaleString()}` : '-'}</td>
                                    <td><span className={`badge ${statusColor[t.status] || 'badge-gray'}`}>{statusMap[t.status] || t.status}</span></td>
                                    <td><button className="btn-icon" onClick={() => deleteT(t._id)} style={{ color: 'var(--accent-red)' }}><FiTrash2 /></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div></div></div>
            )}
        </div>
    );
};

export default TreatmentsList;
