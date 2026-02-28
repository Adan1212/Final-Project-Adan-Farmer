import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fieldsAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2, FiMap, FiX } from 'react-icons/fi';

const FieldsList = () => {
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({
        name: '', size: '', sizeUnit: 'dunam', soilType: 'loamy',
        status: 'active', irrigationType: 'drip', notes: '',
        location: { address: '' }
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => { loadFields(); }, []);

    const loadFields = async () => {
        try {
            const res = await fieldsAPI.getAll();
            setFields(res.data.data);
        } catch (err) { toast.error('שגיאה בטעינת שדות'); }
        setLoading(false);
    };

    const deleteField = async (id) => {
        if (!window.confirm('האם למחוק את השדה?')) return;
        try {
            await fieldsAPI.delete(id);
            setFields(fields.filter(f => f._id !== id));
            toast.success('השדה נמחק');
        } catch (err) { toast.error('שגיאה במחיקה'); }
    };

    const openModal = () => {
        setForm({ name: '', size: '', sizeUnit: 'dunam', soilType: 'loamy', status: 'active', irrigationType: 'drip', notes: '', location: { address: '' } });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await fieldsAPI.create(form);
            toast.success('שדה חדש נוצר');
            setShowModal(false);
            loadFields();
        } catch (err) { toast.error(err.response?.data?.message || 'שגיאה'); }
        setSaving(false);
    };

    const onChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('location.')) {
            setForm({ ...form, location: { ...form.location, [name.split('.')[1]]: value } });
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    const statusMap = { active: 'פעיל', fallow: 'בור', preparation: 'הכנה', harvested: 'נקצר' };
    const soilMap = { clay: 'חרסית', sandy: 'חולית', loamy: 'חרסית-חולית', silt: 'סילט', peat: 'כבול', chalky: 'גירנית' };
    const statusColor = { active: 'badge-green', fallow: 'badge-gray', preparation: 'badge-orange', harvested: 'badge-blue' };

    if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1><FiMap /> ניהול שדות</h1>
                <div className="page-header-actions">
                    <button className="btn btn-primary" onClick={openModal}><FiPlus /> שדה חדש</button>
                </div>
            </div>

            {fields.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-icon">🌾</div>
                        <h3>אין שדות</h3>
                        <p>התחל להוסיף שדות לחווה שלך</p>
                        <button className="btn btn-primary" onClick={openModal}><FiPlus /> הוסף שדה ראשון</button>
                    </div>
                </div>
            ) : (
                <div className="card">
                    <div className="card-body card-body-compact">
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>שם</th>
                                        <th>גודל</th>
                                        <th>סוג קרקע</th>
                                        <th>סוג השקיה</th>
                                        <th>סטטוס</th>
                                        <th>פעולות</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {fields.map(field => (
                                        <tr key={field._id}>
                                            <td><strong>{field.name}</strong></td>
                                            <td>{field.size} {field.sizeUnit === 'dunam' ? 'דונם' : field.sizeUnit}</td>
                                            <td>{soilMap[field.soilType] || field.soilType}</td>
                                            <td>{{ drip: 'טפטוף', sprinkler: 'ממטרות', flood: 'הצפה', center_pivot: 'ציר מרכזי', none: 'ללא' }[field.irrigationType] || field.irrigationType}</td>
                                            <td><span className={`badge ${statusColor[field.status] || 'badge-gray'}`}>{statusMap[field.status] || field.status}</span></td>
                                            <td>
                                                <div className="table-actions">
                                                    <Link to={`/fields/edit/${field._id}`} className="btn-icon" title="עריכה"><FiEdit2 /></Link>
                                                    <button className="btn-icon" onClick={() => deleteField(field._id)} title="מחיקה" style={{ color: 'var(--accent-red)' }}><FiTrash2 /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Field Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
                    <div className="modal">
                        <div className="modal-header">
                            <h3>➕ שדה חדש</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}><FiX /></button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>שם השדה *</label>
                                    <input name="name" value={form.name} onChange={onChange} required placeholder="לדוגמה: שדה צפוני" />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>גודל *</label>
                                        <input type="number" name="size" value={form.size} onChange={onChange} required min="0" step="0.1" placeholder="50" />
                                    </div>
                                    <div className="form-group">
                                        <label>יחידת מידה</label>
                                        <select name="sizeUnit" value={form.sizeUnit} onChange={onChange}>
                                            <option value="dunam">דונם</option>
                                            <option value="hectare">הקטר</option>
                                            <option value="acre">אקר</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>סוג קרקע</label>
                                        <select name="soilType" value={form.soilType} onChange={onChange}>
                                            <option value="clay">חרסית</option>
                                            <option value="sandy">חולית</option>
                                            <option value="loamy">חרסית-חולית</option>
                                            <option value="silt">סילט</option>
                                            <option value="peat">כבול</option>
                                            <option value="chalky">גירנית</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>סוג השקיה</label>
                                        <select name="irrigationType" value={form.irrigationType} onChange={onChange}>
                                            <option value="drip">טפטוף</option>
                                            <option value="sprinkler">ממטרות</option>
                                            <option value="flood">הצפה</option>
                                            <option value="center_pivot">ציר מרכזי</option>
                                            <option value="none">ללא</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>סטטוס</label>
                                    <select name="status" value={form.status} onChange={onChange}>
                                        <option value="active">פעיל</option>
                                        <option value="fallow">בור</option>
                                        <option value="preparation">בהכנה</option>
                                        <option value="harvested">נקצר</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>מיקום</label>
                                    <input name="location.address" value={form.location?.address || ''} onChange={onChange} placeholder="כתובת/תיאור מיקום" />
                                </div>
                                <div className="form-group">
                                    <label>הערות</label>
                                    <textarea name="notes" value={form.notes || ''} onChange={onChange} placeholder="הערות נוספות..." />
                                </div>
                                <div className="form-actions">
                                    <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'שומר...' : 'צור שדה'}</button>
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

export default FieldsList;
