import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import useCart from '../hooks/useCart';

export default function Navbar() {
    const { user, logout, isAdmin, isAuthenticated } = useContext(AuthContext);
    const { theme, toggleTheme } = useTheme();
    const cart = useCart();
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        setIsOpen(false);
        navigate('/login');
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-[var(--border-primary)] bg-[var(--bg-primary)] h-[72px] flex items-center px-6 lg:px-12 backdrop-blur-xl bg-opacity-90">
            <div className="w-full flex items-center justify-between gap-12">

                {/* 1. Left: Brand Logo */}
                <div className="flex-shrink-0">
                    <Link to="/home" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 rounded-lg bg-[var(--primary-color)] flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-white text-xl">shopping_bag</span>
                        </div>
                        <h1 className="text-[var(--text-primary)] text-xl font-black tracking-tighter uppercase leading-none">ShopEase</h1>
                    </Link>
                </div>

                {/* 2. Center: Prominent Search (Authenticated Home Style) */}
                <div className="hidden md:flex flex-1 max-w-2xl relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-500 transition-colors">search</span>
                    <input
                        type="text"
                        placeholder="Search for premium products..."
                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl pl-12 pr-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-color)] transition-all"
                    />
                </div>

                {/* 3. Right: Actions */}
                <div className="flex items-center gap-6">
                    {/* Notifications (Stitch Detail) */}
                    {isAuthenticated() && (
                        <button className="relative p-2 rounded-xl hover:bg-[var(--bg-glass)] transition-colors text-[var(--text-muted)] hover:text-[var(--text-primary)] hidden sm:block">
                            <span className="material-symbols-outlined">notifications</span>
                            <span className="absolute top-2 right-2 w-2 h-2 bg-primary-500 rounded-full border border-primary-500/50"></span>
                        </button>
                    )}

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-xl bg-[var(--bg-glass)] border border-[var(--border-primary)] text-[var(--text-muted)] hover:text-[var(--primary-color)] transition-all hover:scale-110 active:scale-95 flex items-center justify-center group"
                        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                        <span className="material-symbols-outlined text-[20px]">
                            {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                        </span>
                    </button>

                    {/* Cart */}
                    <Link to="/cart" className="relative p-2 rounded-xl hover:bg-[var(--bg-glass)] transition-colors group">
                        <span className="material-symbols-outlined text-[var(--text-muted)] group-hover:text-[var(--primary-color)]">shopping_cart</span>
                        {cart.getTotalItems() > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--primary-color)] text-[10px] font-black text-white shadow-xl">
                                {cart.getTotalItems()}
                            </span>
                        )}
                    </Link>

                    {/* User / Auth */}
                    {isAuthenticated() ? (
                        <div className="flex items-center gap-2 ml-2">
                            <Link to="/profile" className="w-10 h-10 rounded-full border-2 border-[var(--border-primary)] hover:border-primary-500/50 transition-all overflow-hidden bg-[var(--bg-secondary)] flex items-center justify-center">
                                {user?.avatarUrl ? (
                                    <img src={user.avatarUrl} alt="profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="material-symbols-outlined text-[var(--text-muted)]">person</span>
                                )}
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="hidden lg:flex items-center justify-center w-10 h-10 rounded-xl hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-500 transition-colors"
                                title="Logout"
                            >
                                <span className="material-symbols-outlined">logout</span>
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link to="/login" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] font-bold text-xs uppercase tracking-widest px-4 py-2 transition-all">
                                Log in
                            </Link>
                            <Link to="/register" className="bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] text-white text-[11px] font-black uppercase tracking-widest px-6 py-2.5 rounded-xl transition-all shadow-xl shadow-primary-500/20 active:scale-95">
                                Join Now
                            </Link>
                        </div>
                    )}

                    {/* Mobile Toggle */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden p-2 rounded-xl bg-[var(--bg-glass)] text-[var(--text-muted)] ml-2"
                    >
                        <span className="material-symbols-outlined">{isOpen ? 'close' : 'menu'}</span>
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Drawer */}
            {isOpen && (
                <div className="fixed inset-0 z-[60] md:hidden">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Drawer Content */}
                    <div className="absolute right-0 top-0 h-full w-[80%] max-w-sm bg-[var(--bg-primary)] border-l border-[var(--border-primary)] p-6 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-xl font-black text-adaptive tracking-tighter uppercase">Menu</h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 rounded-xl hover:bg-[var(--bg-glass)] text-[var(--text-muted)]"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Integrated Search for Mobile */}
                        <div className="relative mb-8">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm">search</span>
                            <input
                                type="text"
                                placeholder="Search Marketplace..."
                                className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl pl-10 pr-4 py-3 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-primary-500"
                            />
                        </div>

                        <nav className="flex flex-col gap-1">
                            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-3 px-4">Categories</p>
                            <Link to="/products?category=electronics" onClick={() => setIsOpen(false)} className="flex items-center justify-between px-4 py-3.5 rounded-xl hover:bg-[var(--bg-glass)] text-[var(--text-secondary)] hover:text-primary-500 font-bold transition-all">
                                <span className="text-sm">Electronics</span>
                                <span className="material-symbols-outlined text-xs opacity-50">chevron_right</span>
                            </Link>
                            <Link to="/products?category=fashion" onClick={() => setIsOpen(false)} className="flex items-center justify-between px-4 py-3.5 rounded-xl hover:bg-[var(--bg-glass)] text-[var(--text-secondary)] hover:text-primary-500 font-bold transition-all">
                                <span className="text-sm">Fashion</span>
                                <span className="material-symbols-outlined text-xs opacity-50">chevron_right</span>
                            </Link>
                            <Link to="/products?category=living" onClick={() => setIsOpen(false)} className="flex items-center justify-between px-4 py-3.5 rounded-xl hover:bg-[var(--bg-glass)] text-[var(--text-secondary)] hover:text-primary-500 font-bold transition-all">
                                <span className="text-sm">Living</span>
                                <span className="material-symbols-outlined text-xs opacity-50">chevron_right</span>
                            </Link>
                        </nav>

                        <div className="mt-auto pt-8 border-t border-[var(--border-primary)] space-y-4">
                            <button
                                onClick={() => { toggleTheme(); setIsOpen(false); }}
                                className="w-full flex items-center justify-between px-4 py-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-adaptive"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-xl">
                                        {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                                    </span>
                                    <span className="text-xs font-black uppercase tracking-widest">{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>
                                </div>
                                <div className={`w-8 h-4 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-primary-500' : 'bg-slate-700'}`}>
                                    <div className={`absolute top-1 w-2 h-2 rounded-full bg-white transition-all ${theme === 'dark' ? 'left-5' : 'left-1'}`}></div>
                                </div>
                            </button>

                            {isAuthenticated() ? (
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center gap-2 bg-red-500/10 text-red-500 py-4 rounded-2xl font-black uppercase tracking-widest text-xs border border-red-500/20"
                                >
                                    <span className="material-symbols-outlined text-sm">logout</span>
                                    Sign Out
                                </button>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    <Link to="/login" onClick={() => setIsOpen(false)} className="flex items-center justify-center py-4 text-[var(--text-secondary)] font-black uppercase tracking-widest text-[10px] bg-[var(--bg-glass)] rounded-2xl border border-[var(--border-primary)]">
                                        Log In
                                    </Link>
                                    <Link to="/register" onClick={() => setIsOpen(false)} className="flex items-center justify-center bg-primary-500 py-4 rounded-2xl text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary-500/20">
                                        Join
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
