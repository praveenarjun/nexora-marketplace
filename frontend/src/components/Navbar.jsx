import { Link, useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import useCart from '../hooks/useCart';
import { ShoppingCart, User, LogOut, Menu, X, ShieldAlert } from 'lucide-react';

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
        <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center">
                            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                                ShopEase
                            </span>
                        </Link>
                        <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                            <Link to="/products" className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                Shop
                            </Link>
                            {isAdmin() && (
                                <Link to="/admin/orders" className="flex items-center text-rose-600 hover:text-rose-700 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                    <ShieldAlert className="w-4 h-4 mr-1" /> Admin Dashboard
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className="hidden sm:flex sm:items-center sm:space-x-4">
                        <Link to="/cart" className="text-gray-500 hover:text-primary-600 p-2 rounded-full transition-colors relative">
                            <ShoppingCart className="h-6 w-6" />
                            {cart.getTotalItems() > 0 && (
                                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-rose-500 rounded-full">
                                    {cart.getTotalItems()}
                                </span>
                            )}
                        </Link>

                        {isAuthenticated() ? (
                            <div className="flex items-center space-x-4">
                                <Link to="/profile" className="flex items-center text-gray-600 hover:text-primary-600 transition-colors">
                                    <User className="h-5 w-5 mr-1" />
                                    <span className="text-sm font-medium">{user?.firstName}</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center text-gray-500 hover:text-red-600 transition-colors bg-gray-50 px-3 py-1.5 rounded-md text-sm font-medium border border-gray-200 hover:border-red-200"
                                >
                                    <LogOut className="h-4 w-4 mr-1" /> Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Link to="/login" className="text-gray-600 hover:text-primary-700 font-medium text-sm px-4 py-2">
                                    Log in
                                </Link>
                                <Link to="/register" className="bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm px-4 py-2 rounded-lg shadow-sm transition-colors">
                                    Sign up
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="-mr-2 flex items-center sm:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            aria-label={isOpen ? "Close menu" : "Open menu"}
                            aria-expanded={isOpen}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                        >
                            {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <div className="sm:hidden bg-white border-t border-gray-200 shadow-lg">
                    <div className="pt-2 pb-3 space-y-1">
                        <Link to="/products" onClick={() => setIsOpen(false)} className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50">Shop</Link>
                        {isAdmin() && (
                            <Link to="/admin/orders" onClick={() => setIsOpen(false)} className="block pl-3 pr-4 py-2 text-base font-medium text-rose-600 hover:bg-rose-50">Admin Dashboard</Link>
                        )}
                    </div>
                    <div className="pt-4 pb-3 border-t border-gray-200">
                        {isAuthenticated() ? (
                            <div className="space-y-1">
                                <Link to="/profile" onClick={() => setIsOpen(false)} className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50">Profile</Link>
                                <Link to="/orders" onClick={() => setIsOpen(false)} className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50">My Orders</Link>
                                <button onClick={handleLogout} className="w-full text-left block pl-3 pr-4 py-2 text-base font-medium text-red-600 hover:bg-red-50">Logout</button>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                <Link to="/login" onClick={() => setIsOpen(false)} className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50">Login</Link>
                                <Link to="/register" onClick={() => setIsOpen(false)} className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50">Register</Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
