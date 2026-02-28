import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            loadUser();
        } else {
            setLoading(false);
        }
    }, [token]);

    const loadUser = async () => {
        try {
            const res = await authAPI.getMe();
            setUser(res.data.data);
        } catch (err) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
        }
        setLoading(false);
    };

    const login = async (email, password) => {
        const res = await authAPI.login({ email, password });
        const { token: newToken, data } = res.data;
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(data));
        setToken(newToken);
        setUser(data);
        return data;
    };

    const register = async (userData) => {
        const res = await authAPI.register(userData);
        const { token: newToken, data } = res.data;
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(data));
        setToken(newToken);
        setUser(data);
        return data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout, loadUser }}>
            {children}
        </AuthContext.Provider>
    );
};
