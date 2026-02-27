import { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle2, Clock, XCircle, ShoppingBag } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import api from '../services/api';

const STATUS_CONFIG = {
    CREATED: { label: 'Processing', badge: 'badge-blue', icon: Clock },
    CONFIRMED: { label: 'Confirmed', badge: 'badge-purple', icon: CheckCircle2 },
    SHIPPED: { label: 'Shipped', badge: 'badge-purple', icon: Truck },
    DELIVERED: { label: 'Delivered', badge: 'badge-green', icon: CheckCircle2 },
    CANCELLED: { label: 'Cancelled', badge: 'badge-red', icon: XCircle },
};

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchOrders(); }, []);

    const fetchOrders = async () => {
        try {
            const response = await api.get('/api/orders');
            const content = Array.isArray(response.data)
                ? response.data
                : response.data?.data || response.data?.content || [];
            setOrders([...content].reverse());
        } catch {
            toast.error('Failed to load order history');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen py-8 px-4 max-w-4xl mx-auto">
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="glass-card h-40 animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8 px-4 max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-white mb-1">My Order History</h1>
                <p className="text-slate-500 text-sm">Track and manage all your purchases.</p>
            </div>

            {orders.length === 0 ? (
                <div className="glass-card p-16 text-center">
                    <ShoppingBag className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No orders yet</h3>
                    <p className="text-slate-500 text-sm mb-6">When you place orders, they'll appear here.</p>
                    <Link to="/products" className="btn-primary px-6 py-2.5 text-sm">Start Shopping</Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => {
                        const status = order.status || 'CREATED';
                        const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.CREATED;
                        const StatusIcon = cfg.icon;
                        const date = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric', month: 'short', year: 'numeric'
                        }) : '—';

                        return (
                            <div key={order.id} className="glass-card overflow-hidden">
                                {/* Header */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                                    <div className="flex flex-wrap gap-6">
                                        <div>
                                            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Order</div>
                                            <div className="font-mono text-sm font-semibold text-white">#{order.orderNumber}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Placed</div>
                                            <div className="text-sm text-slate-300">{date}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total</div>
                                            <div className="text-sm font-bold gradient-text-blue">
                                                ₹{(order.totalAmount)?.toLocaleString('en-IN')}
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`${cfg.badge} flex items-center gap-1.5 self-start sm:self-auto`}>
                                        <StatusIcon className="w-3.5 h-3.5" />
                                        {cfg.label}
                                    </span>
                                </div>

                                {/* Items */}
                                <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                                    {order.items?.map((item, idx) => (
                                        <div key={item.id || idx} className="flex items-center gap-4 px-5 py-3">
                                            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                                                style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
                                                📦
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-white text-sm truncate">{item.productName || `Product #${item.productId}`}</div>
                                                <div className="text-slate-500 text-xs mt-0.5">Qty: {item.quantity}</div>
                                            </div>
                                            <div className="text-slate-300 text-sm font-semibold">
                                                ₹{item.subtotal?.toLocaleString('en-IN') || (item.unitPrice * item.quantity)?.toLocaleString('en-IN')}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Shipping address */}
                                {order.shippingAddress && (
                                    <div className="px-5 py-3 border-t flex items-start gap-2" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                                        <Truck className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                                        <span className="text-slate-500 text-xs">{order.shippingAddress}</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
