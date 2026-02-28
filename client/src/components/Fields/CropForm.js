import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { cropsAPI, fieldsAPI } from '../../services/api';
import { toast } from 'react-toastify';

const CropForm = () => {
    const nav = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);
    const [fields, setFields] = useState([]);
    const [fd, setFd] = useState({
        fieldId: '', cropType: '', variety: '', plantingDate: '', expectedHarvestDate: '',
        growthStage: 'seedling', status: 'growing', irrigationType: '', fertilizerPlan: '', notes: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fieldsAPI.getAll().then(r => setFields(r.data.data)).catch(() => { });
        if (isEdit) {
            cropsAPI.getById(id).then(r => {
                const c = r.data.data;
                setFd({
                    fieldId: c.fieldId?._id || c.fieldId || '',
                    cropType: c.cropType || '', variety: c.variety || '',
                    plantingDate: c.plantingDate ? c.plantingDate.slice(0, 10) : '',
                    expectedHarvestDate: c.expectedHarvestDate ? c.expectedHarvestDate.slice(0, 10) : '',
                    growthStage: c.growthStage || 'seedling', status: c.status || 'growing',
                    irrigationType: c.irrigationType || '', fertilizerPlan: c.fertilizerPlan || '',
                    notes: c.notes || ''
                });
            }).catch(() => toast.error('שגיאה בטעינה'));
        }
    }, [id, isEdit]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!fd.fieldId || !fd.cropType || !fd.plantingDate) { toast.error('נא למלא שדות חובה'); return; }
        setLoading(true);
        try {
            if (isEdit) await cropsAPI.update(id, fd);
            else await cropsAPI.create(fd);
            toast.success(isEdit ? 'הגידול עודכן' : 'הגידול נוצר');
            nav('/crops');
        } catch (err) { toast.error(err.response?.data?.error || 'שגיאה'); }
        setLoading(false);
    };

    const ch = (e) => setFd({ ...fd, [e.target.name]: e.target.value });

    return (
        <div className="fade-in">
            <div className="page-header"><h1>{isEdit ? 'ערוך גידול' : 'גידול חדש'}</h1></div>
            <div className="card"><div className="card-body">
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
                        <textarea name="notes" value={fd.notes} onChange={ch} rows="3" />
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'שומר...' : (isEdit ? 'עדכן' : 'צור')} גידול</button>
                        <button type="button" className="btn btn-secondary" onClick={() => nav('/crops')}>ביטול</button>
                    </div>
                </form>
            </div></div>
        </div>
    );
};

export default CropForm;
