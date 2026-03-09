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

    // 3. Automated Abandoned Cart Notification (Robust & Persistent)
    useEffect(() => {
        if (!isAuthenticated() || cart.items.length === 0) {
            localStorage.removeItem('shopease_last_cart_activity');
            return;
        }

        // Initialize activity timestamp if not present
        if (!localStorage.getItem('shopease_last_cart_activity')) {
            localStorage.setItem('shopease_last_cart_activity', Date.now().toString());
        }

        const checkInactivity = () => {
            const lastActivity = parseInt(localStorage.getItem('shopease_last_cart_activity'));
            const lastEmailSent = parseInt(localStorage.getItem('shopease_last_abandoned_email_sent') || '0');
            const now = Date.now();

            // 5 minutes = 300,000ms
            const INACTIVITY_LIMIT = 300000;
            // Cooldown 24 hours = 86,400,000ms (to prevent spam)
            const EMAIL_COOLDOWN = 86400000;

            if (now - lastActivity >= INACTIVITY_LIMIT && now - lastEmailSent >= EMAIL_COOLDOWN) {
                console.log('⏰ Inactivity limit reached. Triggering abandoned cart email...');
                api.post('/api/notifications/abandoned-cart', {
                    email: user.email,
                    firstName: user.firstName || 'Customer'
                })
                    .then(() => {
                        localStorage.setItem('shopease_last_abandoned_email_sent', now.toString());
                        console.log('📧 Abandoned cart email sent & cooldown started.');
                    })
                    .catch(err => console.warn('Abandoned cart trigger failed:', err));
            }
        };

        // Check every 30 seconds
        const interval = setInterval(checkInactivity, 30000);

        // Update activity on cart changes (handled by dependency array)
        localStorage.setItem('shopease_last_cart_activity', Date.now().toString());

        return () => clearInterval(interval);
    }, [cart.items.length, isAuthenticated, user?.email, user?.firstName]);

    // 4. Handle Cleanup (No longer flushing on unmount to avoid race conditions with logout state clearing)
    useEffect(() => {
        return () => {
            if (pushTimeoutRef.current) clearTimeout(pushTimeoutRef.current);
        };
    }, []);

    return null; // Side-effect only component
}
