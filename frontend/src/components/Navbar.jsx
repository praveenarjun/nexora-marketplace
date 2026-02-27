import { Link, useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import useCart from '../hooks/useCart';
import { ShoppingCart, User, LogOut, Menu, X, ShieldAlert, ShoppingBag } from 'lucide-react';

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
        <nav className="navbar-glass sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Logo */}
                    <Link to="/home" className="flex items-center gap-2.5 flex-shrink-0">
                        <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                            <ShoppingBag className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-lg font-bold gradient-text">ShopEase</span>
                    </Link>

                    {/* Desktop nav links */}
                    <div className="hidden sm:flex items-center gap-1">
                        <Link to="/home" className="btn-ghost px-4 py-2">Home</Link>
                        <Link to="/products" className="btn-ghost px-4 py-2">Products</Link>
                        {isAuthenticated() && (
                            <Link to="/orders" className="btn-ghost px-4 py-2">My Orders</Link>
                        )}
                        {isAdmin() && (
                            <Link to="/admin/products" className="flex items-center gap-1.5 btn-ghost px-4 py-2 text-primary-400">
                                <ShieldAlert className="w-3.5 h-3.5" /> Admin
                            </Link>
                        )}
                    </div>

                    {/* Right side */}
                    <div className="hidden sm:flex items-center gap-3">
                        {/* Cart */}
                        <Link to="/cart" className="relative btn-ghost p-2 rounded-lg">
                            <ShoppingCart className="h-5 w-5" />
                            {cart.getTotalItems() > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-bold text-white bg-primary-500 rounded-full">
                                    {cart.getTotalItems()}
                                </span>
                            )}
                        </Link>

                        {isAuthenticated() ? (
                            <div className="flex items-center gap-2">
                                <Link to="/profile" className="flex items-center gap-2 btn-ghost px-3 py-1.5 rounded-lg">
                                    <div className="w-7 h-7 rounded-full bg-primary-600/20 flex items-center justify-center border border-primary-500/30">
                                        <User className="h-3.5 w-3.5 text-primary-400" />
                                    </div>
                                    <span className="text-sm font-medium text-slate-300">{user?.firstName}</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="btn-ghost px-3 py-1.5 text-red-400 hover:text-red-300 rounded-lg"
                                >
                                    <LogOut className="h-4 w-4" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link to="/login" className="text-slate-300 hover:text-white font-medium text-sm px-4 py-2 transition-colors">
                                    Log in
                                </Link>
                                <Link to="/register" className="btn-primary px-4 py-2 text-sm">
                                    Sign up
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile hamburger */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label={isOpen ? 'Close menu' : 'Open menu'}
                        className="sm:hidden btn-ghost p-2 rounded-lg"
                    >
                        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <div className="sm:hidden glass-card rounded-none border-x-0 border-b border-t-0 mx-0">
                    <div className="px-4 py-3 space-y-1">
                        <Link to="/" onClick={() => setIsOpen(false)} className="block py-2.5 text-sm text-slate-300 hover:text-white font-medium">Home</Link>
                        <Link to="/products" onClick={() => setIsOpen(false)} className="block py-2.5 text-sm text-slate-300 hover:text-white font-medium">Products</Link>
                        {isAuthenticated() && (
                            <Link to="/orders" onClick={() => setIsOpen(false)} className="block py-2.5 text-sm text-slate-300 hover:text-white font-medium">My Orders</Link>
                        )}
                        {isAdmin() && (
                            <Link to="/admin/products" onClick={() => setIsOpen(false)} className="block py-2.5 text-sm text-primary-400 font-medium">Admin Dashboard</Link>
                        )}
                    </div>
                    <div className="px-4 py-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                        {isAuthenticated() ? (
                            <div className="space-y-1">
                                <Link to="/profile" onClick={() => setIsOpen(false)} className="block py-2.5 text-sm text-slate-300 hover:text-white font-medium">Profile</Link>
                                <button onClick={handleLogout} className="block w-full text-left py-2.5 text-sm text-red-400 font-medium">Logout</button>
                            </div>
                        ) : (
                            <div className="flex gap-3">
                                <Link to="/login" onClick={() => setIsOpen(false)} className="flex-1 text-center py-2.5 text-sm text-slate-300 font-medium">Log in</Link>
                                <Link to="/register" onClick={() => setIsOpen(false)} className="flex-1 btn-primary py-2.5 text-sm text-center">Sign up</Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
