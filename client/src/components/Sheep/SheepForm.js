import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { sheepAPI } from '../../services/api';
import { toast } from 'react-toastify';

const SheepForm = () => {
    const nav = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);
    const [fd, setFd] = useState({
        tagNumber: '', name: '', gender: 'female', breed: '', birthDate: '',
        weight: '', healthStatus: 'healthy', notes: '', color: '',
        motherTag: '', fatherTag: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isEdit) {
            sheepAPI.getById(id).then(r => {
                const s = r.data.data;
                setFd({
                    tagNumber: s.tagNumber || '', name: s.name || '', gender: s.gender || 'female',
                    breed: s.breed || '', birthDate: s.birthDate ? s.birthDate.slice(0, 10) : '',
                    weight: s.weight || '', healthStatus: s.healthStatus || 'healthy',
                    notes: s.notes || '', color: s.color || '',
                    motherTag: s.motherId?.tagNumber || '', fatherTag: s.fatherId?.tagNumber || ''
                });
            }).catch(() => toast.error('שגיאה'));
        }
    }, [id, isEdit]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!fd.tagNumber) { toast.error('נא להזין מספר זיהוי'); return; }
        setLoading(true);
        try {
            const payload = { ...fd, weight: fd.weight ? Number(fd.weight) : undefined };
            delete payload.motherTag; delete payload.fatherTag;
            if (isEdit) await sheepAPI.update(id, payload);
            else await sheepAPI.create(payload);
            toast.success(isEdit ? 'הכבש עודכן' : 'הכבש נוסף');
            nav('/sheep');
        } catch (err) { toast.error(err.response?.data?.error || 'שגיאה'); }
        setLoading(false);
    };

    const ch = (e) => setFd({ ...fd, [e.target.name]: e.target.value });

    return (
        <div className="fade-in">
            <div className="page-header"><h1>{isEdit ? 'ערוך כבש' : '🐑 כבש חדש'}</h1></div>
            <div className="card"><div className="card-body">
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
                        <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'שומר...' : (isEdit ? 'עדכן' : 'הוסף')} כבש</button>
                        <button type="button" className="btn btn-secondary" onClick={() => nav('/sheep')}>ביטול</button>
                    </div>
                </form>
            </div></div>
        </div>
    );
};

export default SheepForm;
