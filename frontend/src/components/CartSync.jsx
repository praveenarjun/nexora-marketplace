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
    const pushTimeoutRef = useRef(null);

    // Sync flush function (can be called manually or on unmount)
    const flushCart = () => {
        if (!isAuthenticated() || isInitialSync.current) return;
        const currentCartString = JSON.stringify(cart.items);
        if (currentCartString !== lastPushedCart.current) {
            console.log('Syncing cart before logout/unmount...');
            // We use a regular api.post here. 
            // In a real prod app, use navigator.sendBeacon for more reliability on close.
            api.post('/api/users/profile/cart', currentCartString, {
                headers: { 'Content-Type': 'text/plain' }
            }).catch(err => console.error('Flush failed', err));
        }
    };

    // 1. Initial Sync from Backend on Login
    useEffect(() => {
        if (!isAuthenticated()) {
            isInitialSync.current = true;
            return;
        }

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
    }, [user?.id, isAuthenticated, cart.mergeItems]);

    // 2. Push Local Changes to Backend
    useEffect(() => {
        if (!isAuthenticated()) {
            // If logging out, we might want to flush one last time, 
            // but usually the logout process wipes the state first.
            return;
        }
        if (isInitialSync.current) return;

        const currentCartString = JSON.stringify(cart.items);

        if (currentCartString !== lastPushedCart.current) {
            if (pushTimeoutRef.current) clearTimeout(pushTimeoutRef.current);

            pushTimeoutRef.current = setTimeout(() => {
                console.log('📤 Pushing cart to backend...');
                api.post('/api/users/profile/cart', currentCartString, {
                    headers: { 'Content-Type': 'text/plain' }
                })
                    .then(() => {
                        lastPushedCart.current = currentCartString;
                    })
                    .catch(err => console.error('Failed to push cart to backend', err));
            }, 1000);

            return () => {
                if (pushTimeoutRef.current) clearTimeout(pushTimeoutRef.current);
            };
        }
    }, [cart.items, isAuthenticated]);

    // 3. Automated Abandoned Cart Notification
    // Trigger "Remind me" email if user is idle with items in cart
    useEffect(() => {
        if (!isAuthenticated() || cart.items.length === 0) return;

        // Auto-send reminder after 5 minutes of having items in cart (for demo/UX)
        const reminderTimer = setTimeout(() => {
            console.log('⏰ Auto-triggering abandoned cart email...');
            api.post('/api/notifications/abandoned-cart', {
                email: user.email,
                firstName: user.firstName || 'Customer'
            }).catch(err => console.warn('Auto-reminder failed (likely expected on dev)', err));
        }, 300000); // 5 minutes

        return () => clearTimeout(reminderTimer);
    }, [cart.items.length, isAuthenticated, user?.email]);

    // 4. Handle Cleanup / Tab Close / Logout race condition
    useEffect(() => {
        return () => {
            flushCart();
        };
    }, []);

    return null; // Side-effect only component
}
