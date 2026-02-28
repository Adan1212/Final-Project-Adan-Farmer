import React, { useState, useEffect } from 'react';
import { vaccinationsAPI, sheepAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FiPlus, FiTrash2, FiX } from 'react-icons/fi';

const VaccinationsList = () => {
    const [vaccinations, setVaccinations] = useState([]);
    const [sheepList, setSheepList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [fd, setFd] = useState({ sheepId: '', vaccinationType: '', date: '', nextDueDate: '', administeredBy: '', notes: '' });

    useEffect(() => {
        Promise.all([
            vaccinationsAPI.getAll(),
            sheepAPI.getAll()
        ]).then(([vr, sr]) => {
            setVaccinations(vr.data.data);
            setSheepList(sr.data.data);
        }).catch(() => toast.error('שגיאה')).finally(() => setLoading(false));
    }, []);

    const deleteV = async (id) => {
        if (!window.confirm('למחוק?')) return;
        try { await vaccinationsAPI.delete(id); setVaccinations(vaccinations.filter(v => v._id !== id)); toast.success('נמחק'); } catch { toast.error('שגיאה'); }
    };

    const addV = async (e) => {
        e.preventDefault();
        if (!fd.sheepId || !fd.vaccinationType || !fd.date) { toast.error('נא למלא שדות חובה'); return; }
        try {
            await vaccinationsAPI.create(fd);
            toast.success('החיסון נוסף');
            setShowModal(false);
            const r = await vaccinationsAPI.getAll();
            setVaccinations(r.data.data);
        } catch { toast.error('שגיאה'); }
    };

    const ch = (e) => setFd({ ...fd, [e.target.name]: e.target.value });

    if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1>💉 ניהול חיסונים</h1>
                <button className="btn btn-primary" onClick={() => { setFd({ sheepId: '', vaccinationType: '', date: '', nextDueDate: '', administeredBy: '', notes: '' }); setShowModal(true); }}><FiPlus /> חיסון חדש</button>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
                    <div className="modal" style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <h3>💉 הוסף חיסון</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}><FiX /></button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={addV}>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>כבש *</label>
                                        <select name="sheepId" value={fd.sheepId} onChange={ch} required>
                                            <option value="">בחר כבש</option>
                                            {sheepList.map(s => <option key={s._id} value={s._id}>{s.tagNumber} {s.name ? `- ${s.name}` : ''}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>סוג חיסון *</label>
                                        <input name="vaccinationType" value={fd.vaccinationType} onChange={ch} required placeholder="למשל: כלבת, ברוצלוזיס..." />
                                    </div>
                                    <div className="form-group">
                                        <label>תאריך *</label>
                                        <input type="date" name="date" value={fd.date} onChange={ch} required />
                                    </div>
                                    <div className="form-group">
                                        <label>חיסון הבא</label>
                                        <input type="date" name="nextDueDate" value={fd.nextDueDate} onChange={ch} />
                                    </div>
                                    <div className="form-group">
                                        <label>וטרינר</label>
                                        <input name="administeredBy" value={fd.administeredBy} onChange={ch} placeholder="ד״ר..." />
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

            {vaccinations.length === 0 ? (
                <div className="card"><div className="empty-state">
                    <div className="empty-icon">💉</div><h3>אין חיסונים</h3><p>הוסף חיסונים לעדר</p>
                </div></div>
            ) : (
                <div className="card"><div className="card-body card-body-compact"><div className="table-container">
                    <table>
                        <thead><tr><th>כבש</th><th>סוג חיסון</th><th>תאריך</th><th>חיסון הבא</th><th>וטרינר</th><th>פעולות</th></tr></thead>
                        <tbody>
                            {vaccinations.map(v => {
                                const overdue = v.nextDueDate && new Date(v.nextDueDate) < new Date();
                                return (
                                    <tr key={v._id} style={overdue ? { background: 'rgba(239,68,68,0.08)' } : {}}>
                                        <td><strong>{v.sheepId?.tagNumber || '-'}</strong></td>
                                        <td>{v.vaccinationType}</td>
                                        <td>{new Date(v.date).toLocaleDateString('he-IL')}</td>
                                        <td>
                                            {v.nextDueDate ? (
                                                <span style={overdue ? { color: 'var(--accent-red)', fontWeight: 'bold' } : {}}>
                                                    {new Date(v.nextDueDate).toLocaleDateString('he-IL')}
                                                    {overdue && ' ⚠️'}
                                                </span>
                                            ) : '-'}
                                        </td>
                                        <td>{v.administeredBy || '-'}</td>
                                        <td><button className="btn-icon" onClick={() => deleteV(v._id)} style={{ color: 'var(--accent-red)' }}><FiTrash2 /></button></td>
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

export default VaccinationsList;
