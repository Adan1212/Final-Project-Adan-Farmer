import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, token } = useAuth();
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
            await login(form.email, form.password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'שגיאה בהתחברות');
        }
        setLoading(false);
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">
                    <div className="logo-icon">🚜</div>
                    <h1>Farm Manager</h1>
                    <p>ניהול חווה חכם</p>
                </div>

                {error && <div className="error-msg">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>אימייל</label>
                        <input
                            type="email"
                            placeholder="adan@farm.com"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>סיסמה</label>
                        <input
                            type="password"
                            placeholder="••••••"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                        {loading ? 'מתחבר...' : 'כניסה'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>אין לך חשבון? <Link to="/register">הרשמה</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Login;
