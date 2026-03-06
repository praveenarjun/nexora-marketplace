import { useEffect, useRef } from 'react';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import useCart from '../hooks/useCart';
import api from '../services/api';

export default function CartSync() {
    const { user, isAuthenticated } = useContext(AuthContext);
    const cart = useCart();
    const isInitialSync = useRef(true);
    const lastPushedCart = useRef(null);

    // 1. Initial Sync from Backend on Login
    useEffect(() => {
        if (isAuthenticated() && isInitialSync.current) {
            console.log('📡 Syncing cart from backend for user:', user.email);
            api.get('/api/users/profile/cart')
                .then(res => {
                    const backendCartData = res.data;
                    if (backendCartData) {
                        try {
                            const items = JSON.parse(backendCartData);
                            if (Array.isArray(items) && items.length > 0) {
                                // Smart merge: combine guest items with backend items
                                cart.mergeItems(items);
                                console.log('✅ Cart merged from backend');
                            }
                        } catch (e) {
                            console.error('Failed to parse backend cart', e);
                        }
                    }
                })
                .catch(err => console.error('Failed to fetch cart from backend', err))
                .finally(() => {
                    isInitialSync.current = false;
                    // Seed lastPushedCart after merge to avoid immediate push back
                    lastPushedCart.current = JSON.stringify(cart.items);
                });
        }
    }, [user, isAuthenticated, cart.setItems]);

    // 2. Push Local Changes to Backend
    useEffect(() => {
        if (!isAuthenticated()) return;
        if (isInitialSync.current) return; // Don't push during the first load

        const currentCartString = JSON.stringify(cart.items);

        // Only push if something actually changed from what we last pushed
        if (currentCartString !== lastPushedCart.current) {
            const timer = setTimeout(() => {
                console.log('📤 Pushing cart to backend...');
                api.post('/api/users/profile/cart', currentCartString, {
                    headers: { 'Content-Type': 'text/plain' }
                })
                    .then(() => {
                        lastPushedCart.current = currentCartString;
                    })
                    .catch(err => console.error('Failed to push cart to backend', err));
            }, 1000); // Debounce pushes

            return () => clearTimeout(timer);
        }
    }, [cart.items, isAuthenticated]);

    return null; // Side-effect only component
}
