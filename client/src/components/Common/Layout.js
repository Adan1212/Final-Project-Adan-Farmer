import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
    FiHome, FiMap, FiLayers, FiSettings, FiLogOut,
    FiSun, FiMoon, FiMenu, FiX, FiDroplet, FiActivity,
    FiClipboard, FiHeart, FiCalendar, FiAlertTriangle,
    FiTrendingUp, FiBarChart2
} from 'react-icons/fi';
import { GiSheep, GiWheat, GiWaterDrop } from 'react-icons/gi';

const Layout = () => {
    const { user, logout } = useAuth();
    const { darkMode, toggleTheme } = useTheme();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    const getPageTitle = () => {
        const path = location.pathname;
        const titles = {
            '/': 'לוח בקרה',
            '/fields': 'ניהול שדות',
            '/fields/new': 'שדה חדש',
            '/crops': 'ניהול גידולים',
            '/crops/new': 'גידול חדש',
            '/operations': 'פעולות חקלאיות',
            '/sheep': 'ניהול עדר',
            '/vaccinations': 'חיסונים',
            '/treatments': 'טיפולים רפואיים',
            '/births': 'לידות',
            '/water': 'ניהול מים חכם',
            '/water/readings': 'קריאות מים',
            '/water/predictions': 'תחזיות AI',
            '/water/anomalies': 'חריגות',
        };
        for (const [key, val] of Object.entries(titles)) {
            if (path === key || path.startsWith(key + '/')) return val;
        }
        return 'Farm Manager';
    };

    return (
        <div className="app-layout">
            {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-brand">
                        <span className="brand-icon">🚜</span>
                        <div className="brand-text">
                            <h2>Farm Manager</h2>
                            <p>{user?.farmName || 'ניהול חווה חכם'}</p>
                        </div>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <div className="nav-section">
                        <div className="nav-section-title">ראשי</div>
                        <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                            <FiHome className="nav-icon" />
                            <span>לוח בקרה</span>
                        </NavLink>
                    </div>

                    <div className="nav-section">
                        <div className="nav-section-title">שדות וגידולים</div>
                        <NavLink to="/fields" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                            <FiMap className="nav-icon" />
                            <span>שדות</span>
                        </NavLink>
                        <NavLink to="/crops" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                            <FiLayers className="nav-icon" />
                            <span>גידולים</span>
                        </NavLink>
                        <NavLink to="/operations" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                            <FiClipboard className="nav-icon" />
                            <span>פעולות חקלאיות</span>
                        </NavLink>
                    </div>

                    <div className="nav-section">
                        <div className="nav-section-title">עדר כבשים</div>
                        <NavLink to="/sheep" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                            <FiActivity className="nav-icon" />
                            <span>כבשים</span>
                        </NavLink>
                        <NavLink to="/vaccinations" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                            <FiHeart className="nav-icon" />
                            <span>חיסונים</span>
                        </NavLink>
                        <NavLink to="/treatments" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                            <FiSettings className="nav-icon" />
                            <span>טיפולים רפואיים</span>
                        </NavLink>
                        <NavLink to="/births" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                            <FiCalendar className="nav-icon" />
                            <span>לידות</span>
                        </NavLink>
                    </div>

                    <div className="nav-section">
                        <div className="nav-section-title">ניהול מים - AI</div>
                        <NavLink to="/water" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                            <FiDroplet className="nav-icon" />
                            <span>סקירת מים</span>
                        </NavLink>
                        <NavLink to="/water/readings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                            <FiBarChart2 className="nav-icon" />
                            <span>קריאות מים</span>
                        </NavLink>
                        <NavLink to="/water/predictions" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                            <FiTrendingUp className="nav-icon" />
                            <span>תחזיות AI</span>
                        </NavLink>
                        <NavLink to="/water/anomalies" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                            <FiAlertTriangle className="nav-icon" />
                            <span>חריגות</span>
                        </NavLink>
                    </div>
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <div className="user-avatar">
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="user-details">
                            <h4>{user?.name || 'משתמש'}</h4>
                            <p>{user?.role === 'admin' ? 'מנהל' : user?.role === 'manager' ? 'מנהל חווה' : 'עובד'}</p>
                        </div>
                    </div>
                    <button className="logout-btn" onClick={logout}>
                        <FiLogOut />
                        <span>התנתקות</span>
                    </button>
                </div>
            </aside>

            <main className="main-content">
                <header className="top-bar">
                    <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
                        {sidebarOpen ? <FiX /> : <FiMenu />}
                    </button>
                    <h1 className="page-title">{getPageTitle()}</h1>
                    <div className="top-bar-right">
                        <button className="theme-toggle" onClick={toggleTheme} title={darkMode ? 'מצב בהיר' : 'מצב כהה'}>
                            {darkMode ? <FiSun /> : <FiMoon />}
                        </button>
                    </div>
                </header>
                <div className="page-content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
