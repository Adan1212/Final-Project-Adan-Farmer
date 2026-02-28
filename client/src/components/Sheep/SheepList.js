import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sheepAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiX } from 'react-icons/fi';

const SheepList = () => {
    const [sheep, setSheep] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [showModal, setShowModal] = useState(false);
    const [fd, setFd] = useState({
        tagNumber: '', name: '', gender: 'female', breed: '', birthDate: '',
        weight: '', healthStatus: 'healthy', notes: '', color: ''
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => { loadSheep(); }, []);

    const loadSheep = async () => {
        try { const r = await sheepAPI.getAll(); setSheep(r.data.data); } catch { toast.error('שגיאה בטעינת הכבשים'); }
        setLoading(false);
    };

    const deleteSheep = async (id) => {
        if (!window.confirm('האם למחוק את הכבש?')) return;
        try { await sheepAPI.delete(id); setSheep(sheep.filter(s => s._id !== id)); toast.success('נמחק'); } catch { toast.error('שגיאה'); }
    };

    const openModal = () => {
        setFd({ tagNumber: '', name: '', gender: 'female', breed: '', birthDate: '', weight: '', healthStatus: 'healthy', notes: '', color: '' });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!fd.tagNumber) { toast.error('נא להזין מספר זיהוי'); return; }
        setSaving(true);
        try {
            const payload = { ...fd, weight: fd.weight ? Number(fd.weight) : undefined };
            await sheepAPI.create(payload);
            toast.success('הכבש נוסף');
            setShowModal(false);
            loadSheep();
        } catch (err) { toast.error(err.response?.data?.error || 'שגיאה'); }
        setSaving(false);
    };

    const ch = (e) => setFd({ ...fd, [e.target.name]: e.target.value });

    const statusMap = { healthy: 'בריא', sick: 'חולה', pregnant: 'בהריון', lambing: 'בהמלטה', recovering: 'בהחלמה' };
    const statusColor = { healthy: 'badge-green', sick: 'badge-red', pregnant: 'badge-purple', lambing: 'badge-orange', recovering: 'badge-blue' };
    const genderMap = { male: 'זכר', female: 'נקבה' };

    const filtered = filter === 'all' ? sheep : sheep.filter(s => s.healthStatus === filter);

    if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1>🐑 ניהול עדר כבשים</h1>
                <button className="btn btn-primary" onClick={openModal}><FiPlus /> כבש חדש</button>
            </div>

            {/* Stats */}
            <div className="stats-grid" style={{ marginBottom: '20px' }}>
                <div className="stat-card" onClick={() => setFilter('all')} style={{ cursor: 'pointer' }}>
                    <div className="stat-number">{sheep.length}</div>
                    <div className="stat-label">סה״כ</div>
                </div>
                <div className="stat-card" onClick={() => setFilter('healthy')} style={{ cursor: 'pointer' }}>
                    <div className="stat-number" style={{ color: 'var(--accent-green)' }}>{sheep.filter(s => s.healthStatus === 'healthy').length}</div>
                    <div className="stat-label">בריאים</div>
                </div>
                <div className="stat-card" onClick={() => setFilter('sick')} style={{ cursor: 'pointer' }}>
                    <div className="stat-number" style={{ color: 'var(--accent-red)' }}>{sheep.filter(s => s.healthStatus === 'sick').length}</div>
                    <div className="stat-label">חולים</div>
                </div>
                <div className="stat-card" onClick={() => setFilter('pregnant')} style={{ cursor: 'pointer' }}>
                    <div className="stat-number" style={{ color: 'var(--accent-purple)' }}>{sheep.filter(s => s.healthStatus === 'pregnant').length}</div>
                    <div className="stat-label">בהריון</div>
                </div>
            </div>

            {/* Filter tabs */}
            <div className="tabs" style={{ marginBottom: '16px' }}>
                {[['all', 'הכל'], ['healthy', 'בריאים'], ['sick', 'חולים'], ['pregnant', 'בהריון'], ['lambing', 'בהמלטה'], ['recovering', 'בהחלמה']].map(([k, v]) => (
                    <button key={k} className={`tab ${filter === k ? 'tab-active' : ''}`} onClick={() => setFilter(k)}>{v}</button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <div className="card"><div className="empty-state">
                    <div className="empty-icon">🐑</div><h3>אין כבשים{filter !== 'all' ? ' בקטגוריה זו' : ''}</h3>
                    {filter === 'all' && <button className="btn btn-primary" onClick={openModal}><FiPlus /> הוסף כבש</button>}
                </div></div>
            ) : (
                <div className="card"><div className="card-body card-body-compact"><div className="table-container">
                    <table>
                        <thead><tr><th>מספר זיהוי</th><th>שם</th><th>מין</th><th>גזע</th><th>תאריך לידה</th><th>משקל (ק״ג)</th><th>מצב בריאות</th><th>פעולות</th></tr></thead>
                        <tbody>
                            {filtered.map(s => (
                                <tr key={s._id}>
                                    <td><strong>{s.tagNumber}</strong></td>
                                    <td>{s.name || '-'}</td>
                                    <td>{genderMap[s.gender] || s.gender}</td>
                                    <td>{s.breed || '-'}</td>
                                    <td>{s.birthDate ? new Date(s.birthDate).toLocaleDateString('he-IL') : '-'}</td>
                                    <td>{s.weight || '-'}</td>
                                    <td><span className={`badge ${statusColor[s.healthStatus] || 'badge-gray'}`}>{statusMap[s.healthStatus] || s.healthStatus}</span></td>
                                    <td><div className="table-actions">
                                        <Link to={`/sheep/${s._id}`} className="btn-icon" title="פרטים"><FiEye /></Link>
                                        <Link to={`/sheep/edit/${s._id}`} className="btn-icon"><FiEdit2 /></Link>
                                        <button className="btn-icon" onClick={() => deleteSheep(s._id)} style={{ color: 'var(--accent-red)' }}><FiTrash2 /></button>
                                    </div></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div></div></div>
            )}

            {/* Add Sheep Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
                    <div className="modal" style={{ maxWidth: '650px' }}>
                        <div className="modal-header">
                            <h3>🐑 כבש חדש</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}><FiX /></button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleSubmit}>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>מספר זיהוי (Tag) *</label>
                                        <input name="tagNumber" value={fd.tagNumber} onChange={ch} required placeholder="למשל: S001" />
                                    </div>
                                    <div className="form-group">
                                        <label>שם</label>
                                        <input name="name" value={fd.name} onChange={ch} placeholder="שם הכבש" />
                                    </div>
                                    <div className="form-group">
                                        <label>מין</label>
                                        <select name="gender" value={fd.gender} onChange={ch}>
                                            <option value="female">נקבה</option>
                                            <option value="male">זכר</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>גזע</label>
                                        <input name="breed" value={fd.breed} onChange={ch} placeholder="אסף, אוואסי..." />
                                    </div>
                                    <div className="form-group">
                                        <label>תאריך לידה</label>
                                        <input type="date" name="birthDate" value={fd.birthDate} onChange={ch} />
                                    </div>
                                    <div className="form-group">
                                        <label>משקל (ק״ג)</label>
                                        <input type="number" name="weight" value={fd.weight} onChange={ch} min="0" step="0.1" />
                                    </div>
                                    <div className="form-group">
                                        <label>צבע</label>
                                        <input name="color" value={fd.color} onChange={ch} placeholder="לבן, חום..." />
                                    </div>
                                    <div className="form-group">
                                        <label>מצב בריאות</label>
                                        <select name="healthStatus" value={fd.healthStatus} onChange={ch}>
                                            <option value="healthy">בריא</option>
                                            <option value="sick">חולה</option>
                                            <option value="pregnant">בהריון</option>
                                            <option value="lambing">בהמלטה</option>
                                            <option value="recovering">בהחלמה</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>הערות</label>
                                    <textarea name="notes" value={fd.notes} onChange={ch} rows="3" />
                                </div>
                                <div className="form-actions">
                                    <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'שומר...' : 'הוסף כבש'}</button>
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>ביטול</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SheepList;
