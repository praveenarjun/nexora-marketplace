import { Link, useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import useCart from '../hooks/useCart';

export default function Navbar() {
    const { user, logout, isAdmin, isAuthenticated } = useContext(AuthContext);
    const cart = useCart();
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        setIsOpen(false);
        navigate('/login');
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0a0b10]/90 backdrop-blur-xl h-[72px] flex items-center px-6 lg:px-12">
            <div className="w-full flex items-center justify-between gap-12">

                {/* 1. Left: Brand Logo */}
                <div className="flex-shrink-0">
                    <Link to="/home" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-white text-xl">shopping_bag</span>
                        </div>
                        <h1 className="text-white text-xl font-black tracking-tighter uppercase leading-none">ShopEase</h1>
                    </Link>
                </div>

                {/* 2. Center: Prominent Search (Authenticated Home Style) */}
                <div className="hidden md:flex flex-1 max-w-2xl relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-500 transition-colors">search</span>
                    <input
                        type="text"
                        placeholder="Search for premium products..."
                        className="w-full bg-[#1c1d26] border border-white/5 rounded-2xl pl-12 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary-500/50 transition-all"
                    />
                </div>

                {/* 3. Right: Actions */}
                <div className="flex items-center gap-6">
                    {/* Notifications (Stitch Detail) */}
                    {isAuthenticated() && (
                        <button className="relative p-2 rounded-xl hover:bg-white/5 transition-colors text-slate-400 hover:text-white hidden sm:block">
                            <span className="material-symbols-outlined">notifications</span>
                            <span className="absolute top-2 right-2 w-2 h-2 bg-primary-500 rounded-full border border-[#0a0b10]"></span>
                        </button>
                    )}

                    {/* Cart */}
                    <Link to="/cart" className="relative p-2 rounded-xl hover:bg-white/5 transition-colors group">
                        <span className="material-symbols-outlined text-slate-400 group-hover:text-primary-500">shopping_cart</span>
                        {cart.getTotalItems() > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary-500 text-[10px] font-black text-white shadow-xl">
                                {cart.getTotalItems()}
                            </span>
                        )}
                    </Link>

                    {/* User / Auth */}
                    {isAuthenticated() ? (
                        <div className="flex items-center gap-2 ml-2">
                            <Link to="/profile" className="w-10 h-10 rounded-full border-2 border-white/10 hover:border-primary-500/50 transition-all overflow-hidden bg-slate-800 flex items-center justify-center">
                                {user?.avatarUrl ? (
                                    <img src={user.avatarUrl} alt="profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="material-symbols-outlined text-slate-500">person</span>
                                )}
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="hidden lg:flex items-center justify-center w-10 h-10 rounded-xl hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors"
                                title="Logout"
                            >
                                <span className="material-symbols-outlined">logout</span>
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link to="/login" className="text-slate-400 hover:text-white font-bold text-xs uppercase tracking-widest px-4 py-2 transition-all">
                                Log in
                            </Link>
                            <Link to="/register" className="bg-primary-500 hover:bg-primary-600 text-white text-[11px] font-black uppercase tracking-widest px-6 py-2.5 rounded-xl transition-all shadow-xl shadow-primary-500/20 active:scale-95">
                                Join Now
                            </Link>
                        </div>
                    )}

                    {/* Mobile Toggle */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden p-2 rounded-xl bg-white/5 text-slate-300 ml-2"
                    >
                        <span className="material-symbols-outlined">{isOpen ? 'close' : 'menu'}</span>
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Dropdown */}
            {isOpen && (
                <div className="absolute top-[72px] left-0 w-full bg-[#0a0b10] border-b border-white/10 p-6 md:hidden space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
                    <div className="relative mb-6">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">search</span>
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full bg-[#1c1d26] border border-white/5 rounded-xl pl-10 pr-4 py-3 text-sm text-white"
                        />
                    </div>

                    <nav className="grid grid-cols-1 gap-1">
                        <Link to="/products?category=electronics" onClick={() => setIsOpen(false)} className="px-4 py-3 rounded-xl hover:bg-white/5 text-slate-400 font-bold uppercase tracking-widest text-xs">Electronics</Link>
                        <Link to="/products?category=fashion" onClick={() => setIsOpen(false)} className="px-4 py-3 rounded-xl hover:bg-white/5 text-slate-400 font-bold uppercase tracking-widest text-xs">Fashion</Link>
                        <Link to="/products?category=living" onClick={() => setIsOpen(false)} className="px-4 py-3 rounded-xl hover:bg-white/5 text-slate-400 font-bold uppercase tracking-widest text-xs">Living</Link>
                    </nav>

                    <div className="pt-6 border-t border-white/5 flex flex-col gap-3">
                        {isAuthenticated() ? (
                            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-red-500/10 text-red-400 py-4 rounded-2xl font-black uppercase tracking-widest text-xs">
                                <span className="material-symbols-outlined text-sm">logout</span> Sign Out
                            </button>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                <Link to="/login" onClick={() => setIsOpen(false)} className="text-center py-4 text-slate-400 font-black uppercase tracking-widest text-xs">Log In</Link>
                                <Link to="/register" onClick={() => setIsOpen(false)} className="text-center bg-primary-500 py-4 rounded-2xl text-white font-black uppercase tracking-widest text-xs">Join</Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
