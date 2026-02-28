import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { sheepAPI, vaccinationsAPI, treatmentsAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FiEdit2, FiArrowRight } from 'react-icons/fi';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement,
    LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const SheepDetail = () => {
    const { id } = useParams();
    const [sheep, setSheep] = useState(null);
    const [vaccinations, setVaccinations] = useState([]);
    const [treatments, setTreatments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            sheepAPI.getById(id),
            vaccinationsAPI.getAll().catch(() => ({ data: { data: [] } })),
            treatmentsAPI.getAll().catch(() => ({ data: { data: [] } }))
        ]).then(([sr, vr, tr]) => {
            setSheep(sr.data.data);
            setVaccinations((vr.data.data || []).filter(v => (v.sheepId?._id || v.sheepId) === id));
            setTreatments((tr.data.data || []).filter(t => (t.sheepId?._id || t.sheepId) === id));
        }).catch(() => toast.error('שגיאה')).finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="loading-container"><div className="spinner"></div></div>;
    if (!sheep) return <div className="card"><div className="empty-state"><h3>כבש לא נמצא</h3></div></div>;

    const statusMap = { healthy: 'בריא', sick: 'חולה', pregnant: 'בהריון', lambing: 'בהמלטה', recovering: 'בהחלמה' };
    const statusColor = { healthy: 'badge-green', sick: 'badge-red', pregnant: 'badge-purple', lambing: 'badge-orange', recovering: 'badge-blue' };

    const weightData = sheep.weightHistory && sheep.weightHistory.length > 0 ? {
        labels: sheep.weightHistory.map(w => new Date(w.date).toLocaleDateString('he-IL')),
        datasets: [{
            label: 'משקל (ק״ג)',
            data: sheep.weightHistory.map(w => w.weight),
            borderColor: '#4f46e5',
            backgroundColor: 'rgba(79,70,229,0.1)',
            fill: true, tension: 0.3
        }]
    } : null;

    return (
        <div className="fade-in">
            <div className="page-header">
                <h1>🐑 {sheep.name || sheep.tagNumber}</h1>
                <div>
                    <Link to={`/sheep/edit/${sheep._id}`} className="btn btn-primary" style={{ marginLeft: '8px' }}><FiEdit2 /> ערוך</Link>
                    <Link to="/sheep" className="btn btn-secondary"><FiArrowRight /> חזרה</Link>
                </div>
            </div>

            {/* Info Cards */}
            <div className="stats-grid" style={{ marginBottom: '20px' }}>
                <div className="stat-card">
                    <div className="stat-label">מספר זיהוי</div>
                    <div className="stat-number" style={{ fontSize: '24px' }}>{sheep.tagNumber}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">מצב בריאות</div>
                    <span className={`badge ${statusColor[sheep.healthStatus]}`} style={{ fontSize: '16px' }}>{statusMap[sheep.healthStatus]}</span>
                </div>
                <div className="stat-card">
                    <div className="stat-label">משקל</div>
                    <div className="stat-number" style={{ fontSize: '24px' }}>{sheep.weight ? `${sheep.weight} ק״ג` : '-'}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">גיל</div>
                    <div className="stat-number" style={{ fontSize: '24px' }}>
                        {sheep.birthDate ? `${Math.floor((Date.now() - new Date(sheep.birthDate)) / (365.25 * 24 * 60 * 60 * 1000))} שנים` : '-'}
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                {/* Details */}
                <div className="card"><div className="card-body">
                    <h3 style={{ marginBottom: '16px' }}>פרטים</h3>
                    <div style={{ display: 'grid', gap: '12px' }}>
                        <div><strong>מין:</strong> {sheep.gender === 'male' ? 'זכר' : 'נקבה'}</div>
                        <div><strong>גזע:</strong> {sheep.breed || '-'}</div>
                        <div><strong>צבע:</strong> {sheep.color || '-'}</div>
                        <div><strong>תאריך לידה:</strong> {sheep.birthDate ? new Date(sheep.birthDate).toLocaleDateString('he-IL') : '-'}</div>
                        {sheep.notes && <div><strong>הערות:</strong> {sheep.notes}</div>}
                    </div>
                </div></div>

                {/* Weight Chart */}
                <div className="card"><div className="card-body">
                    <h3 style={{ marginBottom: '16px' }}>היסטוריית משקל</h3>
                    {weightData ? (
                        <div className="chart-container"><Line data={weightData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} /></div>
                    ) : (
                        <div className="empty-state" style={{ padding: '30px 0' }}><p>אין נתוני משקל היסטוריים</p></div>
                    )}
                </div></div>
            </div>

            {/* Vaccinations */}
            <div className="card" style={{ marginBottom: '20px' }}><div className="card-body">
                <h3 style={{ marginBottom: '16px' }}>💉 חיסונים ({vaccinations.length})</h3>
                {vaccinations.length === 0 ? <p style={{ color: 'var(--text-light)' }}>אין חיסונים</p> : (
                    <div className="table-container"><table>
                        <thead><tr><th>סוג חיסון</th><th>תאריך</th><th>חיסון הבא</th><th>וטרינר</th></tr></thead>
                        <tbody>{vaccinations.map(v => (
                            <tr key={v._id}>
                                <td>{v.vaccinationType}</td>
                                <td>{new Date(v.date).toLocaleDateString('he-IL')}</td>
                                <td>{v.nextDueDate ? new Date(v.nextDueDate).toLocaleDateString('he-IL') : '-'}</td>
                                <td>{v.administeredBy || '-'}</td>
                            </tr>
                        ))}</tbody>
                    </table></div>
                )}
            </div></div>

            {/* Treatments */}
            <div className="card"><div className="card-body">
                <h3 style={{ marginBottom: '16px' }}>💊 טיפולים רפואיים ({treatments.length})</h3>
                {treatments.length === 0 ? <p style={{ color: 'var(--text-light)' }}>אין טיפולים</p> : (
                    <div className="table-container"><table>
                        <thead><tr><th>אבחנה</th><th>טיפול</th><th>תאריך</th><th>סטטוס</th></tr></thead>
                        <tbody>{treatments.map(t => (
                            <tr key={t._id}>
                                <td>{t.diagnosis}</td>
                                <td>{t.treatment}</td>
                                <td>{new Date(t.date).toLocaleDateString('he-IL')}</td>
                                <td><span className={`badge ${t.status === 'resolved' ? 'badge-green' : t.status === 'ongoing' ? 'badge-orange' : 'badge-blue'}`}>
                                    {t.status === 'resolved' ? 'טופל' : t.status === 'ongoing' ? 'בטיפול' : 'מעקב'}
                                </span></td>
                            </tr>
                        ))}</tbody>
                    </table></div>
                )}
            </div></div>
        </div>
    );
};

export default SheepDetail;
