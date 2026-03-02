import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import useCart from '../hooks/useCart';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

export default function Checkout() {
    const cart = useCart();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [isProcessing, setIsProcessing] = useState(false);
    const [shippingAddress, setShippingAddress] = useState(user?.address || '');

    const subtotal = cart.getSubtotal();
    const shipping = cart.getShipping();
    const tax = cart.getTax();
    const total = cart.getTotalAmount();

    // If cart is empty, user shouldn't be here
    if (cart.items.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-24 text-center">
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/10">
                    <span className="material-symbols-outlined text-4xl text-slate-700">shopping_cart_off</span>
                </div>
                <h2 className="text-3xl font-black text-white mb-2">Cart is empty</h2>
                <p className="text-slate-500 mb-10 max-w-md mx-auto">Add some premium components to your inventory before proceeding to checkout.</p>
                <Link to="/products" className="inline-flex items-center gap-2 bg-primary-500 px-10 py-4 rounded-xl font-bold text-white hover:bg-primary-600 transition-all shadow-xl shadow-primary-500/20 active:scale-95">
                    Browse Marketplace
                </Link>
            </div>
        );
    }

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        if (!shippingAddress.trim()) {
            toast.error('Shipping address is required');
            return;
        }

        setIsProcessing(true);

        try {
            const orderPayload = {
                shippingAddress,
                items: cart.items.map(item => ({
                    productId: item.productId,
                    skuCode: item.skuCode,
                    price: item.price,
                    quantity: item.quantity
                }))
            };

            await api.post('/api/orders', orderPayload);
            cart.clearCart();
            toast.success('Order placed successfully! Check your email for confirmation.', { duration: 5000 });
            navigate('/orders');

        } catch (err) {
            console.error('Order failed:', err);
            if (err.response?.status === 503) {
                toast.error('The Order Service is currently waking up. Please try again in 60 seconds.');
            } else {
                toast.error(err.response?.data?.message || 'Failed to place order. Please try again.');
            }
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto w-full px-6 py-12">
            <div className="flex items-center gap-4 mb-12">
                <Link to="/cart" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                </Link>
                <h1 className="text-5xl font-black text-white tracking-tighter">Checkout</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                {/* Checkout Form */}
                <div className="lg:col-span-7 space-y-8">
                    <form onSubmit={handlePlaceOrder} className="space-y-6">
                        {/* Contact Information */}
                        <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-md">
                            <h2 className="text-xl font-black text-white mb-6 flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary-500">person</span>
                                Contact Information
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Full Name</label>
                                    <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-bold">
                                        {user?.firstName} {user?.lastName}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Email Address</label>
                                    <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-bold truncate">
                                        {user?.email}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-md">
                            <h2 className="text-xl font-black text-white mb-6 flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary-500">local_shipping</span>
                                Delivery Details
                            </h2>
                            <div>
                                <label htmlFor="address" className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">
                                    Shipping Address
                                </label>
                                <textarea
                                    id="address"
                                    required
                                    rows={3}
                                    value={shippingAddress}
                                    onChange={(e) => setShippingAddress(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all placeholder:text-slate-600"
                                    placeholder="Enter your full delivery address..."
                                />
                            </div>
                        </div>

                        {/* Payment Information */}
                        <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 backdrop-blur-md">
                            <h2 className="text-xl font-black text-white mb-6 flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary-500">shield</span>
                                Secure Payment
                            </h2>
                            <div className="bg-primary-500/10 border border-primary-500/20 rounded-2xl p-6 flex gap-4">
                                <span className="material-symbols-outlined text-primary-500">info</span>
                                <p className="text-sm text-slate-300 font-medium leading-relaxed">
                                    This is a demonstration environment. <span className="text-white font-bold">No real payment is required.</span> Confirming this order will simulate a production transaction flow.
                                </p>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isProcessing}
                            className={`w-full bg-primary-500 py-5 rounded-2xl font-black text-white text-xl tracking-tight hover:bg-primary-600 transition-all shadow-2xl shadow-primary-500/20 active:scale-95 flex items-center justify-center gap-3 ${isProcessing ? 'opacity-70 cursor-wait' : ''}`}
                        >
                            {isProcessing ? 'PROCESSING TRANSACTION...' : 'CONFIRM ORDER & PAY'}
                            <span className="material-symbols-outlined">lock</span>
                        </button>
                    </form>
                </div>

                {/* Order Summary Sidebar */}
                <aside className="lg:col-span-5">
                    <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 sticky top-28 backdrop-blur-md">
                        <h2 className="text-2xl font-black text-white mb-8 tracking-tight border-b border-white/5 pb-4">Order Summary</h2>

                        <div className="max-h-[40vh] overflow-y-auto pr-2 space-y-4 mb-8 custom-scrollbar">
                            {cart.items.map((item) => (
                                <div key={item.productId} className="flex gap-4 p-3 bg-white/5 rounded-2xl border border-white/5">
                                    <div className="w-16 h-16 bg-slate-800 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center font-black text-slate-600 text-xs">
                                        {item.product?.imageUrls?.[0] ? (
                                            <img src={item.product.imageUrls[0]} alt={item.name} className="w-full h-full object-cover" />
                                        ) : item.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-bold text-white text-sm truncate pr-2">{item.name}</h3>
                                            <p className="font-bold text-white text-sm">₹{(item.price * item.quantity).toLocaleString()}</p>
                                        </div>
                                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                                            <span>Qty {item.quantity}</span>
                                            <span className="text-primary-500/50">{item.skuCode}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4 pt-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 font-bold uppercase tracking-widest">Subtotal</span>
                                <span className="text-white font-bold">₹{subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 font-bold uppercase tracking-widest">Shipping</span>
                                <span className="text-green-400 font-bold uppercase tracking-widest">{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm pb-6 border-b border-white/5">
                                <span className="text-slate-500 font-bold uppercase tracking-widest">Tax (GST)</span>
                                <span className="text-white font-bold">₹{tax.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-end pt-4">
                                <span className="text-xs text-slate-400 font-black uppercase tracking-[0.2em]">Total</span>
                                <span className="text-4xl font-black text-white tracking-tighter">₹{total.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="mt-8 flex items-center gap-3 justify-center text-slate-600">
                            <span className="material-symbols-outlined text-lg">verified_user</span>
                            <span className="text-[10px] font-black uppercase tracking-widest">Encrypted & Secure</span>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
