import { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';
import useCart from '../hooks/useCart';

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

    const logout = useCallback(async () => {
        // 1. Flush cart to backend while token still exists
        try {
            const cart = useCart.getState();
            if (user && cart.items.length > 0) {
                console.log('Final cart flush before logout...');
                const currentCartString = JSON.stringify(cart.items);
                // Use the raw api instance to ensure headers are kept
                await api.post('/api/users/profile/cart', currentCartString, {
                    headers: { 'Content-Type': 'text/plain' }
                });
            }
        } catch (err) {
            console.warn('Final cart flush failed, proceeding with logout', err);
        }

        // 2. Clear local storage and state
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('shopease-cart-storage');

        try {
            const cart = useCart.getState();
            if (cart && cart.clearCart) {
                cart.clearCart();
            }
        } catch (err) {
            console.error('Logout cart clear failed', err);
        }
        setUser(null);
    }, [user]);

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
