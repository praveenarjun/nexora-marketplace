import { Link, useNavigate } from 'react-router-dom';
import useCart from '../hooks/useCart';
import { toast } from 'react-hot-toast';

export default function Cart() {
    const cart = useCart();
    const navigate = useNavigate();

    const subtotal = cart.getSubtotal();
    const shipping = cart.getShipping();
    const tax = cart.getTax();
    const total = cart.getTotalAmount();

    if (cart.items.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-24 text-center">
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/10">
                    <span className="material-symbols-outlined text-4xl text-slate-700">shopping_cart_off</span>
                </div>
                <h2 className="text-3xl font-black text-white mb-2">Collection is empty</h2>
                <p className="text-slate-500 mb-10 max-w-md mx-auto">Your digital inventory is currently vacant. Explore the marketplace to acquire premium microservice components.</p>
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
                <h1 className="text-5xl font-black text-white tracking-tighter">Inventory</h1>
                <span className="bg-primary-500/10 text-primary-500 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest border border-primary-500/20">
                    {cart.getTotalItems()} Units
                </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                {/* Cart Items */}
                <div className="lg:col-span-8 space-y-4">
                    {cart.items.map((item) => (
                        <div key={item.productId} className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-white/5 border border-white/10 rounded-3xl group hover:border-primary-500/30 transition-all">
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
                                    <h3 className="text-xl font-bold text-white group-hover:text-primary-400 transition-colors truncate">{item.name}</h3>
                                    <button
                                        onClick={() => cart.removeItem(item.productId)}
                                        className="text-slate-600 hover:text-red-500 transition-colors p-1"
                                    >
                                        <span className="material-symbols-outlined text-xl">delete</span>
                                    </button>
                                </div>
                                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono mb-4">
                                    <span>{item.skuCode || 'SKU-PENDING'}</span>
                                    <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                                    <span className="text-primary-500/80">Available</span>
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center bg-white/5 rounded-xl p-1 border border-white/10 h-10">
                                        <button
                                            onClick={() => cart.updateQuantity(item.productId, item.quantity - 1)}
                                            className="w-8 h-full flex items-center justify-center hover:bg-white/5 rounded-lg text-slate-400 transition-all"
                                        >
                                            <span className="material-symbols-outlined text-sm">remove</span>
                                        </button>
                                        <span className="w-10 text-center text-white font-bold text-sm">{item.quantity}</span>
                                        <button
                                            onClick={() => cart.updateQuantity(item.productId, item.quantity + 1)}
                                            className="w-8 h-full flex items-center justify-center hover:bg-white/5 rounded-lg text-slate-400 transition-all"
                                        >
                                            <span className="material-symbols-outlined text-sm">add</span>
                                        </button>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-0.5">Price</div>
                                        <div className="text-xl font-black text-white">₹{(item.price * item.quantity).toLocaleString()}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    <Link to="/products" className="inline-flex items-center gap-2 text-slate-500 hover:text-primary-500 font-bold transition-all p-2 bg-transparent">
                        <span className="material-symbols-outlined text-sm">add_circle</span>
                        ADD MORE COMPONENTS
                    </Link>
                </div>

                {/* Order Summary */}
                <aside className="lg:col-span-4">
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 sticky top-28 backdrop-blur-md">
                        <h2 className="text-2xl font-black text-white mb-8 tracking-tight">Summary</h2>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 font-bold uppercase tracking-widest">Subtotal</span>
                                <span className="text-white font-bold">₹{subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 font-bold uppercase tracking-widest">Est. Shipping</span>
                                <span className="text-green-500 font-bold uppercase tracking-widest">{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm pb-6 border-b border-white/5">
                                <span className="text-slate-500 font-bold uppercase tracking-widest">Est. Taxes (18%)</span>
                                <span className="text-white font-bold">₹{tax.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-end pt-4">
                                <span className="text-xs text-slate-400 font-black uppercase tracking-[0.2em]">Total Amount</span>
                                <span className="text-4xl font-black text-white tracking-tighter">₹{total.toLocaleString()}</span>
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
                            <p className="text-[10px] text-slate-600 text-center font-bold uppercase tracking-widest leading-relaxed">
                                Security encrypted checkout. <br />All transactions are processed via bank-grade SSL.
                            </p>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
