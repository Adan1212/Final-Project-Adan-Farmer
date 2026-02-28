import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
    const [form, setForm] = useState({ name: '', email: '', password: '', farmName: '', role: 'manager' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register, token } = useAuth();
    const navigate = useNavigate();

    if (token) {
        navigate('/');
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(form);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'שגיאה בהרשמה');
        }
        setLoading(false);
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">
                    <div className="logo-icon">🚜</div>
                    <h1>Farm Manager</h1>
                    <p>יצירת חשבון חדש</p>
                </div>

                {error && <div className="error-msg">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>שם מלא</label>
                        <input
                            type="text"
                            placeholder="שם מלא"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>אימייל</label>
                        <input
                            type="email"
                            placeholder="your@email.com"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>סיסמה</label>
                        <input
                            type="password"
                            placeholder="לפחות 6 תווים"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            required
                            minLength={6}
                        />
                    </div>
                    <div className="form-group">
                        <label>שם החווה</label>
                        <input
                            type="text"
                            placeholder="החווה שלי"
                            value={form.farmName}
                            onChange={(e) => setForm({ ...form, farmName: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label>תפקיד</label>
                        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                            <option value="admin">מנהל (Admin)</option>
                            <option value="manager">מנהל חווה (Manager)</option>
                            <option value="worker">עובד (Worker)</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                        {loading ? 'יוצר חשבון...' : 'הרשמה'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>יש לך חשבון? <Link to="/login">כניסה</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Register;
