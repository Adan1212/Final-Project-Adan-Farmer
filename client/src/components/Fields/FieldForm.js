import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fieldsAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FiSave, FiArrowRight } from 'react-icons/fi';

const FieldForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [form, setForm] = useState({
        name: '', size: '', sizeUnit: 'dunam', soilType: 'loamy',
        status: 'active', irrigationType: 'drip', notes: '',
        location: { address: '' }
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isEdit) loadField();
    }, [id]);

    const loadField = async () => {
        try {
            const res = await fieldsAPI.getById(id);
            setForm(res.data.data);
        } catch (err) { toast.error('שגיאה בטעינה'); navigate('/fields'); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isEdit) {
                await fieldsAPI.update(id, form);
                toast.success('השדה עודכן');
            } else {
                await fieldsAPI.create(form);
                toast.success('שדה חדש נוצר');
            }
            navigate('/fields');
        } catch (err) { toast.error(err.response?.data?.message || 'שגיאה'); }
        setLoading(false);
    };

    const onChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('location.')) {
            setForm({ ...form, location: { ...form.location, [name.split('.')[1]]: value } });
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    return (
        <div className="form-page fade-in">
            <div className="page-header">
                <h1>{isEdit ? '✏️ עריכת שדה' : '➕ שדה חדש'}</h1>
                <button className="btn btn-secondary" onClick={() => navigate('/fields')}>
                    <FiArrowRight /> חזרה
                </button>
            </div>

            <div className="card">
                <div className="card-body">
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
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                <FiSave /> {loading ? 'שומר...' : isEdit ? 'עדכן' : 'צור שדה'}
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={() => navigate('/fields')}>ביטול</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default FieldForm;
