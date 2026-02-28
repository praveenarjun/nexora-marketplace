import { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check local storage for persistent session
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (storedUser && token) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (err) {
                console.error('Failed to parse user session', err);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);

    const login = useCallback((userData, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    }, []);

    const register = useCallback(async (userData) => {
        const response = await api.post('/api/auth/register', userData);
        return response.data;
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    }, []);

    const isAdmin = useCallback(() => {
        return user?.role === 'ADMIN';
    }, [user]);

    const isAuthenticated = useCallback(() => {
        return !!user;
    }, [user]);

    const contextValue = useMemo(() => ({
        user,
        login,
        register,
        logout,
        isAdmin,
        isAuthenticated,
        loading
    }), [user, login, register, logout, isAdmin, isAuthenticated, loading]);

    return (
        <AuthContext.Provider value={contextValue}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
