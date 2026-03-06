import { Link, useNavigate } from 'react-router-dom';
import useCart from '../hooks/useCart';
import { toast } from 'react-hot-toast';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

export default function Cart() {
    const cart = useCart();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const subtotal = cart.getSubtotal();
    const shipping = cart.getShipping();
    const tax = cart.getTax();
    const total = cart.getTotalAmount();

    if (cart.items.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-24 text-center">
                <div className="w-24 h-24 bg-[var(--bg-glass)] rounded-full flex items-center justify-center mx-auto mb-8 border border-[var(--border-primary)] shadow-lg">
                    <span className="material-symbols-outlined text-4xl text-[var(--text-muted)]">shopping_cart_off</span>
                </div>
                <h2 className="text-3xl font-black text-adaptive mb-2">Collection is empty</h2>
                <p className="text-[var(--text-secondary)] mb-10 max-w-md mx-auto font-medium">Your digital inventory is currently vacant. Explore the marketplace to acquire premium microservice components.</p>
                <Link to="/products" className="inline-flex items-center gap-2 bg-primary-500 px-10 py-4 rounded-xl font-bold text-white hover:bg-primary-600 transition-all shadow-xl shadow-primary-500/20 active:scale-95">
                    Browse Marketplace
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto w-full px-6 py-12">
            <div className="flex items-center gap-4 mb-12">
                <h1 className="text-5xl font-black text-adaptive tracking-tighter">Inventory</h1>
                <span className="bg-primary-500/10 text-primary-500 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border border-primary-500/20">
                    {cart.getTotalItems()} Units
                </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                {/* Cart Items */}
                <div className="lg:col-span-8 space-y-4">
                    {cart.items.map((item) => (
                        <div key={item.productId} className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-3xl group hover:border-primary-500/30 transition-all shadow-sm">
                            {/* Image */}
                            <div className="w-28 h-28 bg-slate-800 rounded-2xl overflow-hidden flex-shrink-0">
                                {item.product?.imageUrls?.[0] ? (
                                    <img src={item.product.imageUrls[0]} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-primary-500/5">
                                        <span className="material-symbols-outlined text-3xl text-primary-500/30">inventory_2</span>
                                    </div>
                                )}
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="text-xl font-bold text-adaptive group-hover:text-primary-500 transition-colors truncate">{item.name}</h3>
                                    <button
                                        onClick={() => cart.removeItem(item.productId)}
                                        className="text-[var(--text-muted)] hover:text-red-500 transition-colors p-1"
                                    >
                                        <span className="material-symbols-outlined text-xl">delete</span>
                                    </button>
                                </div>
                                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] font-mono mb-4">
                                    <span>{item.skuCode || 'SKU-PENDING'}</span>
                                    <span className="w-1 h-1 bg-primary-500/30 rounded-full"></span>
                                    <span className="text-primary-500/80">Available</span>
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center bg-[var(--bg-glass)] rounded-xl p-1 border border-[var(--border-primary)] h-10">
                                        <button
                                            onClick={() => cart.updateQuantity(item.productId, item.quantity - 1)}
                                            className="w-8 h-full flex items-center justify-center hover:bg-[var(--bg-glass)] rounded-lg text-[var(--text-secondary)] transition-all"
                                        >
                                            <span className="material-symbols-outlined text-sm">remove</span>
                                        </button>
                                        <span className="w-10 text-center text-adaptive font-bold text-sm">{item.quantity}</span>
                                        <button
                                            onClick={() => cart.updateQuantity(item.productId, item.quantity + 1)}
                                            className="w-8 h-full flex items-center justify-center hover:bg-[var(--bg-glass)] rounded-lg text-[var(--text-secondary)] transition-all"
                                        >
                                            <span className="material-symbols-outlined text-sm">add</span>
                                        </button>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-[var(--text-muted)] uppercase font-bold tracking-widest mb-0.5">Price</div>
                                        <div className="text-xl font-black text-adaptive">₹{(item.price * item.quantity).toLocaleString()}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    <Link to="/products" className="inline-flex items-center gap-2 text-[var(--text-primary)] hover:text-primary-500 font-black transition-all p-2 bg-transparent uppercase tracking-widest text-xs">
                        <span className="material-symbols-outlined text-sm">add_circle</span>
                        ADD MORE COMPONENTS
                    </Link>
                </div>

                {/* Order Summary */}
                <aside className="lg:col-span-4">
                    <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-3xl p-8 sticky top-28 backdrop-blur-md shadow-xl">
                        <h2 className="text-2xl font-black text-adaptive mb-8 tracking-tight">Summary</h2>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-[var(--text-secondary)] font-bold uppercase tracking-widest">Subtotal</span>
                                <span className="text-adaptive font-bold">₹{subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-[var(--text-secondary)] font-bold uppercase tracking-widest">Est. Shipping</span>
                                <span className="text-green-500 font-bold uppercase tracking-widest">{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm pb-6 border-b border-[var(--border-primary)]">
                                <span className="text-[var(--text-secondary)] font-bold uppercase tracking-widest">Est. Taxes (18%)</span>
                                <span className="text-adaptive font-bold">₹{tax.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-end pt-4">
                                <span className="text-xs text-[var(--text-muted)] font-black uppercase tracking-[0.2em]">Total Amount</span>
                                <span className="text-4xl font-black text-adaptive tracking-tighter">₹{total.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="mt-10 space-y-4">
                            <button
                                onClick={() => navigate('/checkout')}
                                className="w-full bg-primary-500 py-4 rounded-2xl font-black text-white text-lg tracking-tight hover:bg-primary-600 transition-all shadow-xl shadow-primary-500/20 active:scale-95 flex items-center justify-center gap-3"
                            >
                                PROCEED TO CHECKOUT
                                <span className="material-symbols-outlined text-xl">payments</span>
                            </button>

                            <button
                                onClick={async () => {
                                    if (!user) {
                                        toast.error('Please login to use this feature');
                                        return;
                                    }
                                    const loadingToast = toast.loading('Sending reminder...');
                                    try {
                                        await api.post('/api/notifications/abandoned-cart', {
                                            email: user.email,
                                            firstName: user.firstName,
                                            timestamp: new Date().toISOString()
                                        });
                                        toast.success('Check your inbox! Reminder sent.', { id: loadingToast });
                                    } catch (err) {
                                        toast.error('Failed to send email. Check mail service health.', { id: loadingToast });
                                    }
                                }}
                                className="w-full bg-[var(--bg-glass)] border border-[var(--border-primary)] py-3 rounded-2xl font-bold text-[var(--text-secondary)] text-sm hover:bg-[var(--bg-secondary)] transition-all flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-lg">mail</span>
                                REMIND ME VIA EMAIL
                            </button>

                            <p className="text-[10px] text-[var(--text-muted)] text-center font-bold uppercase tracking-widest leading-relaxed">
                                Security encrypted checkout. <br />All transactions are processed via bank-grade SSL.
                            </p>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
