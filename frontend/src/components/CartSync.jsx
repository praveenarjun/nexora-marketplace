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
            console.log('📡 [CartSync] Syncing cart from backend for user:', user.email);
            api.get('/api/users/profile/cart')
                .then(res => {
                    const backendCartData = res.data;
                    const guestItems = cart.items;

                    if (backendCartData) {
                        try {
                            // If it's already an object (parsed by axios), use it. 
                            // Otherwise, parse it.
                            let items = backendCartData;
                            if (typeof backendCartData === 'string') {
                                items = JSON.parse(backendCartData);
                            }

                            if (Array.isArray(items)) {
                                const currentLocalString = JSON.stringify(cart.items);
                                const backendString = JSON.stringify(items);

                                if (currentLocalString === backendString) {
                                    console.log('✨ [CartSync] Local cart already in sync with backend. Skipping merge.');
                                } else {
                                    console.log(`✅ [CartSync] Found ${items.length} items on backend. Merging...`);
                                    cart.mergeItems(items);
                                }
                            } else {
                                console.warn('⚠️ [CartSync] Backend cart data is not an array:', items);
                            }
                        } catch (e) {
                            console.error('❌ [CartSync] Failed to parse backend cart', e);
                        }
                    } else if (guestItems.length > 0) {
                        // If backend is empty but guest has items, push them now!
                        console.log('📤 [CartSync] Backend empty, pushing guest cart to server...');
                        const guestCartString = JSON.stringify(guestItems);
                        api.post('/api/users/profile/cart', guestCartString, {
                            headers: { 'Content-Type': 'text/plain' }
                        }).catch(err => console.error('Guest push failed', err));
                    }
                })
                .catch(err => console.error('❌ [CartSync] Failed to fetch cart from backend', err))
                .finally(() => {
                    isInitialSync.current = false;
                    // Seed lastPushedCart with current state to prevent immediate re-push
                    lastPushedCart.current = JSON.stringify(useCart.getState().items);
                    console.log('🏁 [CartSync] Initial sync complete');
                });
        }
    }, [user?.id, isAuthenticated]);

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

    // 4. Handle Cleanup (No longer flushing on unmount to avoid race conditions with logout state clearing)
    useEffect(() => {
        return () => {
            if (pushTimeoutRef.current) clearTimeout(pushTimeoutRef.current);
        };
    }, []);

    return null; // Side-effect only component
}
