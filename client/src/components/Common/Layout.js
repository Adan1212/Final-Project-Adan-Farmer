import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import {
    FiHome, FiMap, FiLayers, FiSettings, FiLogOut,
    FiSun, FiMoon, FiMenu, FiX, FiDroplet, FiActivity,
    FiClipboard, FiHeart, FiCalendar, FiAlertTriangle,
    FiTrendingUp, FiBarChart2, FiGlobe
} from 'react-icons/fi';
import { GiSheep, GiWheat, GiWaterDrop } from 'react-icons/gi';

const Layout = () => {
    const { user, logout } = useAuth();
    const { darkMode, toggleTheme } = useTheme();
    const { language, toggleLanguage, t } = useLanguage();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    const getPageTitle = () => {
        const path = location.pathname;
        const titles = t('pageTitles') || {};
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
                            <h2>{t('appName')}</h2>
                            <p>{user?.farmName || t('smartFarm')}</p>
                        </div>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <div className="nav-section">
                        <div className="nav-section-title">{t('main')}</div>
                        <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                            <FiHome className="nav-icon" />
                            <span>{t('dashboard')}</span>
                        </NavLink>
                    </div>

                    <div className="nav-section">
                        <div className="nav-section-title">{t('fieldsAndCrops')}</div>
                        <NavLink to="/fields" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                            <FiMap className="nav-icon" />
                            <span>{t('fields')}</span>
                        </NavLink>
                        <NavLink to="/crops" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                            <FiLayers className="nav-icon" />
                            <span>{t('crops')}</span>
                        </NavLink>
                        <NavLink to="/operations" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                            <FiClipboard className="nav-icon" />
                            <span>{t('agriculturalOps')}</span>
                        </NavLink>
                    </div>

                    <div className="nav-section">
                        <div className="nav-section-title">{t('sheepFlock')}</div>
                        <NavLink to="/sheep" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                            <FiActivity className="nav-icon" />
                            <span>{t('sheep')}</span>
                        </NavLink>
                        <NavLink to="/vaccinations" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                            <FiHeart className="nav-icon" />
                            <span>{t('vaccinations')}</span>
                        </NavLink>
                        <NavLink to="/treatments" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                            <FiSettings className="nav-icon" />
                            <span>{t('medicalTreatments')}</span>
                        </NavLink>
                        <NavLink to="/births" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                            <FiCalendar className="nav-icon" />
                            <span>{t('births')}</span>
                        </NavLink>
                    </div>

                    <div className="nav-section">
                        <div className="nav-section-title">{t('waterAI')}</div>
                        <NavLink to="/water" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                            <FiDroplet className="nav-icon" />
                            <span>{t('waterOverview')}</span>
                        </NavLink>
                        <NavLink to="/water/readings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                            <FiBarChart2 className="nav-icon" />
                            <span>{t('waterReadings')}</span>
                        </NavLink>
                        <NavLink to="/water/predictions" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                            <FiTrendingUp className="nav-icon" />
                            <span>{t('aiPredictions')}</span>
                        </NavLink>
                        <NavLink to="/water/anomalies" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                            <FiAlertTriangle className="nav-icon" />
                            <span>{t('anomalies')}</span>
                        </NavLink>
                    </div>
                </nav>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <div className="user-avatar">
                            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="user-details">
                            <h4>{user?.name || t('user')}</h4>
                            <p>{user?.role === 'admin' ? t('admin') : user?.role === 'manager' ? t('farmManager') : t('employee')}</p>
                        </div>
                    </div>
                    <button className="logout-btn" onClick={logout}>
                        <FiLogOut />
                        <span>{t('logout')}</span>
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
                        <button
                            className="theme-toggle lang-toggle"
                            onClick={toggleLanguage}
                            title={language === 'he' ? 'Switch to English' : 'עבור לעברית'}
                            style={{ marginRight: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                            <FiGlobe />
                            <span style={{ fontSize: '12px', fontWeight: 600 }}>{language === 'he' ? 'EN' : 'HE'}</span>
                        </button>
                        <button className="theme-toggle" onClick={toggleTheme} title={darkMode ? t('lightMode') : t('darkMode')}>
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
