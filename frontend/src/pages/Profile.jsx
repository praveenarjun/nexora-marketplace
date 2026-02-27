import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { User, Mail, MapPin, Shield, ShoppingBag, Edit3, Save, X, Package, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Profile() {
    const { user, login } = useContext(AuthContext);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [orders, setOrders] = useState([]);
    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        address: user?.address || '',
    });

    useEffect(() => {
        // Load recent orders count
        api.get('/api/orders')
            .then(res => {
                const content = Array.isArray(res.data) ? res.data : res.data?.data || [];
                setOrders(content);
            })
            .catch(() => { });
    }, []);

    if (!user) return null;

    const initials = `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase();

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await api.put('/api/users/profile', formData);
            const updated = response.data?.data || response.data;
            // Update auth context with new data
            const token = localStorage.getItem('authToken');
            login({ ...user, ...formData }, token);
            toast.success('Profile updated!');
            setEditing(false);
        } catch {
            toast.error('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData({ firstName: user.firstName, lastName: user.lastName, address: user.address || '' });
        setEditing(false);
    };

    const totalSpent = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const activeOrders = orders.filter(o => ['CREATED', 'CONFIRMED', 'SHIPPED'].includes(o.status)).length;

    return (
        <div className="min-h-screen py-8 px-4 max-w-4xl mx-auto animate-fade-in">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-white mb-1">My Profile</h1>
                <p className="text-slate-500 text-sm">Manage your personal information and preferences.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ── Left: Avatar Card ── */}
                <div className="glass-card p-6 flex flex-col items-center text-center">
                    {/* Avatar */}
                    <div className="relative mb-4">
                        <div className="w-24 h-24 rounded-2xl flex items-center justify-center text-2xl font-black text-white animate-glow-pulse"
                            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                            {initials}
                        </div>
                        {user.role === 'ADMIN' && (
                            <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-red-500 flex items-center justify-center border-2 border-black">
                                <Shield className="w-3.5 h-3.5 text-white" />
                            </div>
                        )}
                    </div>

                    <h2 className="text-xl font-bold text-white mb-1">{user.firstName} {user.lastName}</h2>
                    <p className="text-slate-400 text-sm mb-3">{user.email}</p>

                    <span className={`badge mb-4 ${user.role === 'ADMIN' ? 'badge-red' : 'badge-blue'}`}>
                        {user.role === 'ADMIN' ? '👑 Admin' : '🛍️ Customer'}
                    </span>

                    <div className="w-full space-y-3 mt-2">
                        <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                            <span className="text-slate-500 text-xs">Member since</span>
                            <span className="text-slate-300 text-xs font-medium">2024</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                            <span className="text-slate-500 text-xs">Total orders</span>
                            <span className="text-white text-xs font-bold">{orders.length}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-slate-500 text-xs">Total spent</span>
                            <span className="gradient-text-blue text-xs font-bold">₹{totalSpent.toLocaleString('en-IN')}</span>
                        </div>
                    </div>
                </div>

                {/* ── Right: Details ── */}
                <div className="lg:col-span-2 space-y-4">

                    {/* Personal Info */}
                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <User className="w-4 h-4 text-primary-400" /> Personal Information
                            </h3>
                            {!editing ? (
                                <button onClick={() => setEditing(true)} className="btn-ghost text-xs px-3 py-1.5 gap-1.5">
                                    <Edit3 className="w-3.5 h-3.5" /> Edit
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button onClick={handleSave} disabled={saving} className="btn-primary py-1.5 px-3 text-xs">
                                        <Save className="w-3.5 h-3.5" /> {saving ? 'Saving…' : 'Save'}
                                    </button>
                                    <button onClick={handleCancel} className="btn-secondary py-1.5 px-3 text-xs">
                                        <X className="w-3.5 h-3.5" /> Cancel
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-slate-500 mb-1.5 block">First name</label>
                                    {editing ? (
                                        <input value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} className="input-dark text-sm" />
                                    ) : (
                                        <p className="text-white text-sm font-medium">{user.firstName}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 mb-1.5 block">Last name</label>
                                    {editing ? (
                                        <input value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} className="input-dark text-sm" />
                                    ) : (
                                        <p className="text-white text-sm font-medium">{user.lastName}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-slate-500 mb-1.5 flex items-center gap-1.5">
                                    <Mail className="w-3.5 h-3.5" /> Email address
                                </label>
                                <p className="text-slate-300 text-sm">{user.email}</p>
                            </div>

                            <div>
                                <label className="text-xs text-slate-500 mb-1.5 flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5" /> Shipping address
                                </label>
                                {editing ? (
                                    <textarea value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} rows={2} className="input-dark text-sm resize-none" />
                                ) : (
                                    <p className="text-slate-300 text-sm">{user.address || <span className="text-slate-600 italic">No address set</span>}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Order Stats */}
                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <Package className="w-4 h-4 text-primary-400" /> Recent Activity
                            </h3>
                            <Link to="/orders" className="text-primary-400 text-xs hover:text-primary-300">View all →</Link>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-4">
                            {[
                                { label: 'Total Orders', value: orders.length, icon: ShoppingBag },
                                { label: 'Active Orders', value: activeOrders, icon: Clock },
                                { label: 'Total Spent', value: `₹${totalSpent.toLocaleString('en-IN')}`, icon: Package },
                            ].map(({ label, value, icon: Icon }) => (
                                <div key={label} className="p-3 rounded-xl text-center" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
                                    <Icon className="w-4 h-4 text-primary-400 mx-auto mb-1.5" />
                                    <div className="text-white font-bold text-lg">{value}</div>
                                    <div className="text-slate-500 text-xs">{label}</div>
                                </div>
                            ))}
                        </div>

                        {orders.length === 0 ? (
                            <p className="text-slate-600 text-sm text-center py-4">No orders placed yet.</p>
                        ) : (
                            <div className="space-y-2">
                                {orders.slice(0, 3).map(order => (
                                    <div key={order.id} className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                                        <span className="font-mono text-xs text-slate-400">#{order.orderNumber}</span>
                                        <span className={`badge text-xs ${order.status === 'DELIVERED' ? 'badge-green' : order.status === 'CANCELLED' ? 'badge-red' : 'badge-blue'}`}>
                                            {order.status}
                                        </span>
                                        <span className="text-slate-300 text-xs font-medium">₹{order.totalAmount?.toLocaleString('en-IN')}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
