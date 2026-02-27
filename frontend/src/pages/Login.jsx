import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Eye, EyeOff, ArrowRight, Mail, Lock, ShoppingBag, Star, Shield, Zap } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

export default function Login() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await api.post('/api/auth/login', formData);
            const { token, ...userData } = response.data;
            login(userData, token);
            toast.success('Welcome back!');
            navigate(userData.role === 'ADMIN' ? '/admin/products' : '/products');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed. Check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialLogin = (provider) => {
        toast(`${provider} sign-in coming soon!`, { icon: '🔒' });
    };

    return (
        <div className="min-h-screen flex animate-fade-in" style={{ background: '#000000' }}>
            {/* ── Left: Brand Panel ── */}
            <div className="hidden lg:flex lg:w-1/2 auth-brand-panel flex-col justify-between p-12 relative">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                            <ShoppingBag className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-white">ShopEase</span>
                    </div>
                </div>

                <div className="relative z-10 flex-1 flex flex-col justify-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-medium mb-6 w-fit border border-white/20">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                        Trusted by 10,000+ businesses worldwide
                    </div>
                    <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-4">
                        Experience the next generation of shopping.
                    </h1>
                    <p className="text-white/70 text-lg leading-relaxed mb-10">
                        Join thousands of users and access our exclusive microservices-powered e-commerce ecosystem.
                    </p>

                    <div className="space-y-4">
                        {[
                            { Icon: Shield, title: 'Enterprise Security', desc: 'JWT + Role-based access control' },
                            { Icon: Zap, title: 'Lightning Fast', desc: 'Redis-cached product catalog' },
                            { Icon: Star, title: 'Event-Driven', desc: 'RabbitMQ async order processing' },
                        ].map(({ Icon, title, desc }) => (
                            <div key={title} className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 border border-white/20">
                                    <Icon className="w-5 h-5 text-white/80" />
                                </div>
                                <div>
                                    <div className="text-white font-semibold text-sm">{title}</div>
                                    <div className="text-white/60 text-xs">{desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative z-10 text-white/40 text-xs">
                    © 2024 ShopEase Inc. Built with Microservices Architecture.
                </div>
            </div>

            {/* ── Right: Sign In Form ── */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-16">
                {/* Mobile logo */}
                <div className="lg:hidden flex items-center gap-2 mb-8">
                    <ShoppingBag className="w-6 h-6 text-primary-400" />
                    <span className="text-xl font-bold text-white">ShopEase</span>
                </div>

                <div className="w-full max-w-md animate-slide-up">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                        <p className="text-slate-400 text-sm">Please enter your credentials to access your account.</p>
                    </div>

                    {/* Social Auth */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <button
                            onClick={() => {
                                const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
                                window.location.href = `${baseUrl}/oauth2/authorization/google`;
                            }}
                            className="btn-secondary text-sm py-2.5"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Google
                        </button>
                        <button
                            onClick={() => {
                                const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
                                window.location.href = `${baseUrl}/oauth2/authorization/github`;
                            }}
                            className="btn-secondary text-sm py-2.5"
                        >
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                            GitHub
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }}></div>
                        <span className="text-slate-500 text-xs">or continue with email</span>
                        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }}></div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email address</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="input-dark pl-10"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-sm font-medium text-slate-300">Password</label>
                                <Link to="/forgot-password" className="text-xs text-primary-400 hover:text-primary-300">Forgot Password?</Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="input-dark pl-10 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary w-full py-3 mt-2"
                        >
                            {isLoading ? (
                                <span className="spinner w-4 h-4"></span>
                            ) : (
                                <>Sign In <ArrowRight className="w-4 h-4" /></>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-slate-500 text-xs mt-6">
                        By signing in, you agree to our{' '}
                        <a href="#" className="text-primary-400 hover:underline">Terms</a>
                        {' '}and{' '}
                        <a href="#" className="text-primary-400 hover:underline">Privacy Policy</a>
                    </p>

                    <p className="text-center text-slate-400 text-sm mt-6">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-primary-400 font-semibold hover:text-primary-300">
                            Create one
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
