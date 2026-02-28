import React, { useState, useEffect } from 'react';
import { operationsAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FiPlus, FiTrash2, FiClipboard, FiX } from 'react-icons/fi';

const OperationsList = () => {
    const [operations, setOperations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [fd, setFd] = useState({ operationType: 'plowing', fieldId: '', cropId: '', date: '', description: '', cost: 0, status: 'planned' });

    useEffect(() => { loadOps(); }, []);

    const loadOps = async () => {
        try { const r = await operationsAPI.getAll(); setOperations(r.data.data); } catch { toast.error('שגיאה'); }
        setLoading(false);
    };

    const deleteOp = async (id) => {
        if (!window.confirm('למחוק את הפעולה?')) return;
        try { await operationsAPI.delete(id); setOperations(operations.filter(o => o._id !== id)); toast.success('נמחק'); } catch { toast.error('שגיאה'); }
    };

    const addOp = async (e) => {
        e.preventDefault();
        try { await operationsAPI.create(fd); toast.success('הפעולה נוספה'); setShowModal(false); loadOps(); } catch { toast.error('שגיאה'); }
    };

    const typeMap = { plowing: 'חריש', sowing: 'זריעה', irrigation: 'השקיה', fertilizing: 'דישון', spraying: 'ריסוס', harvesting: 'קציר', pruning: 'גיזום', weeding: 'ניכוש', other: 'אחר' };
    const statusMap = { planned: 'מתוכנן', in_progress: 'בביצוע', completed: 'הושלם', cancelled: 'בוטל' };
    const statusColor = { planned: 'badge-blue', in_progress: 'badge-orange', completed: 'badge-green', cancelled: 'badge-red' };
    const ch = (e) => setFd({ ...fd, [e.target.name]: e.target.value });

    if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1><FiClipboard /> יומן פעולות חקלאיות</h1>
                <button className="btn btn-primary" onClick={() => { setFd({ operationType: 'plowing', fieldId: '', cropId: '', date: '', description: '', cost: 0, status: 'planned' }); setShowModal(true); }}><FiPlus /> פעולה חדשה</button>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
                    <div className="modal" style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <h3>📋 הוסף פעולה</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}><FiX /></button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={addOp}>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>סוג פעולה</label>
                                        <select name="operationType" value={fd.operationType} onChange={ch}>
                                            {Object.entries(typeMap).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>תאריך</label>
                                        <input type="date" name="date" value={fd.date} onChange={ch} required />
                                    </div>
                                    <div className="form-group">
                                        <label>עלות (₪)</label>
                                        <input type="number" name="cost" value={fd.cost} onChange={ch} min="0" />
                                    </div>
                                    <div className="form-group">
                                        <label>סטטוס</label>
                                        <select name="status" value={fd.status} onChange={ch}>
                                            {Object.entries(statusMap).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>תיאור</label>
                                    <textarea name="description" value={fd.description} onChange={ch} rows="2" />
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

            {operations.length === 0 ? (
                <div className="card"><div className="empty-state">
                    <div className="empty-icon">📋</div><h3>אין פעולות</h3><p>הוסף פעולות חקלאיות ליומן</p>
                </div></div>
            ) : (
                <div className="card"><div className="card-body card-body-compact"><div className="table-container">
                    <table>
                        <thead><tr><th>סוג</th><th>תאריך</th><th>שדה</th><th>תיאור</th><th>עלות</th><th>סטטוס</th><th>פעולות</th></tr></thead>
                        <tbody>
                            {operations.map(op => (
                                <tr key={op._id}>
                                    <td><strong>{typeMap[op.operationType] || op.operationType}</strong></td>
                                    <td>{new Date(op.date).toLocaleDateString('he-IL')}</td>
                                    <td>{op.fieldId?.name || '-'}</td>
                                    <td>{op.description?.substring(0, 50) || '-'}</td>
                                    <td>{op.cost ? `₪${op.cost.toLocaleString()}` : '-'}</td>
                                    <td><span className={`badge ${statusColor[op.status] || 'badge-gray'}`}>{statusMap[op.status] || op.status}</span></td>
                                    <td><button className="btn-icon" onClick={() => deleteOp(op._id)} style={{ color: 'var(--accent-red)' }}><FiTrash2 /></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div></div></div>
            )}
        </div>
    );
};

export default OperationsList;
