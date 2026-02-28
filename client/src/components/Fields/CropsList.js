import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cropsAPI, fieldsAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2, FiLayers, FiX } from 'react-icons/fi';

const CropsList = () => {
    const [crops, setCrops] = useState([]);
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [fd, setFd] = useState({
        fieldId: '', cropType: '', variety: '', plantingDate: '', expectedHarvestDate: '',
        growthStage: 'seedling', status: 'growing', irrigationType: '', fertilizerPlan: '', notes: ''
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => { loadCrops(); }, []);

    const loadCrops = async () => {
        try {
            const [cr, fr] = await Promise.all([cropsAPI.getAll(), fieldsAPI.getAll()]);
            setCrops(cr.data.data);
            setFields(fr.data.data);
        } catch (err) { toast.error('שגיאה בטעינה'); }
        setLoading(false);
    };

    const deleteCrop = async (id) => {
        if (!window.confirm('האם למחוק את הגידול?')) return;
        try {
            await cropsAPI.delete(id);
            setCrops(crops.filter(c => c._id !== id));
            toast.success('הגידול נמחק');
        } catch (err) { toast.error('שגיאה'); }
    };

    const openModal = () => {
        setFd({ fieldId: '', cropType: '', variety: '', plantingDate: '', expectedHarvestDate: '', growthStage: 'seedling', status: 'growing', irrigationType: '', fertilizerPlan: '', notes: '' });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!fd.fieldId || !fd.cropType || !fd.plantingDate) { toast.error('נא למלא שדות חובה'); return; }
        setSaving(true);
        try {
            await cropsAPI.create(fd);
            toast.success('הגידול נוצר');
            setShowModal(false);
            loadCrops();
        } catch (err) { toast.error(err.response?.data?.error || 'שגיאה'); }
        setSaving(false);
    };

    const ch = (e) => setFd({ ...fd, [e.target.name]: e.target.value });

    const stageMap = { seedling: 'שתיל', vegetative: 'צמיחה', flowering: 'פריחה', fruiting: 'פירות', maturity: 'בשלות', harvest_ready: 'מוכן לקציר' };
    const statusMap = { growing: 'בצמיחה', harvested: 'נקצר', failed: 'נכשל', planned: 'מתוכנן' };
    const stageColor = { seedling: 'badge-green', vegetative: 'badge-blue', flowering: 'badge-purple', fruiting: 'badge-orange', maturity: 'badge-teal', harvest_ready: 'badge-red' };

    if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1><FiLayers /> ניהול גידולים</h1>
                <button className="btn btn-primary" onClick={openModal}><FiPlus /> גידול חדש</button>
            </div>

            {crops.length === 0 ? (
                <div className="card"><div className="empty-state">
                    <div className="empty-icon">🌱</div>
                    <h3>אין גידולים</h3>
                    <p>הוסף גידולים לשדות שלך</p>
                    <button className="btn btn-primary" onClick={openModal}><FiPlus /> הוסף גידול</button>
                </div></div>
            ) : (
                <div className="card"><div className="card-body card-body-compact"><div className="table-container">
                    <table>
                        <thead><tr>
                            <th>גידול</th><th>שדה</th><th>שלב צמיחה</th><th>תאריך שתילה</th><th>קציר צפוי</th><th>סטטוס</th><th>פעולות</th>
                        </tr></thead>
                        <tbody>
                            {crops.map(crop => (
                                <tr key={crop._id}>
                                    <td><strong>{crop.cropType}</strong>{crop.variety && <span style={{ color: 'var(--text-light)', fontSize: '12px' }}> ({crop.variety})</span>}</td>
                                    <td>{crop.fieldId?.name || '-'}</td>
                                    <td><span className={`badge ${stageColor[crop.growthStage] || 'badge-gray'}`}>{stageMap[crop.growthStage] || crop.growthStage}</span></td>
                                    <td>{new Date(crop.plantingDate).toLocaleDateString('he-IL')}</td>
                                    <td>{crop.expectedHarvestDate ? new Date(crop.expectedHarvestDate).toLocaleDateString('he-IL') : '-'}</td>
                                    <td><span className="badge badge-green">{statusMap[crop.status] || crop.status}</span></td>
                                    <td><div className="table-actions">
                                        <Link to={`/crops/edit/${crop._id}`} className="btn-icon"><FiEdit2 /></Link>
                                        <button className="btn-icon" onClick={() => deleteCrop(crop._id)} style={{ color: 'var(--accent-red)' }}><FiTrash2 /></button>
                                    </div></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div></div></div>
            )}

            {/* Add Crop Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
                    <div className="modal" style={{ maxWidth: '650px' }}>
                        <div className="modal-header">
                            <h3>🌱 גידול חדש</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}><FiX /></button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleSubmit}>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>שדה *</label>
                                        <select name="fieldId" value={fd.fieldId} onChange={ch} required>
                                            <option value="">בחר שדה</option>
                                            {fields.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>סוג גידול *</label>
                                        <input name="cropType" value={fd.cropType} onChange={ch} required placeholder="חיטה, עגבניות..." />
                                    </div>
                                    <div className="form-group">
                                        <label>זן</label>
                                        <input name="variety" value={fd.variety} onChange={ch} placeholder="זן ספציפי" />
                                    </div>
                                    <div className="form-group">
                                        <label>תאריך שתילה *</label>
                                        <input type="date" name="plantingDate" value={fd.plantingDate} onChange={ch} required />
                                    </div>
                                    <div className="form-group">
                                        <label>קציר צפוי</label>
                                        <input type="date" name="expectedHarvestDate" value={fd.expectedHarvestDate} onChange={ch} />
                                    </div>
                                    <div className="form-group">
                                        <label>שלב צמיחה</label>
                                        <select name="growthStage" value={fd.growthStage} onChange={ch}>
                                            <option value="seedling">שתיל</option>
                                            <option value="vegetative">צמיחה</option>
                                            <option value="flowering">פריחה</option>
                                            <option value="fruiting">פירות</option>
                                            <option value="maturity">בשלות</option>
                                            <option value="harvest_ready">מוכן לקציר</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>סטטוס</label>
                                        <select name="status" value={fd.status} onChange={ch}>
                                            <option value="growing">בצמיחה</option>
                                            <option value="harvested">נקצר</option>
                                            <option value="failed">נכשל</option>
                                            <option value="planned">מתוכנן</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>סוג השקיה</label>
                                        <input name="irrigationType" value={fd.irrigationType} onChange={ch} placeholder="טפטוף, ממטרה..." />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>תכנית דשון</label>
                                    <textarea name="fertilizerPlan" value={fd.fertilizerPlan} onChange={ch} rows="2" placeholder="פרט תכנית דשון..." />
                                </div>
                                <div className="form-group">
                                    <label>הערות</label>
                                    <textarea name="notes" value={fd.notes} onChange={ch} rows="2" />
                                </div>
                                <div className="form-actions">
                                    <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'שומר...' : 'צור גידול'}</button>
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

export default CropsList;
