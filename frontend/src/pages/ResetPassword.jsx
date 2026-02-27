import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowRight, Mail, Lock, Eye, EyeOff, ShoppingBag, Shield, Zap, Star } from 'lucide-react';
import api from '../services/api';

export default function ResetPassword() {
    const [formData, setFormData] = useState({ email: '', otp: '', newPassword: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Pre-fill email if passed from ForgotPassword page
        if (location.state?.email) {
            setFormData(prev => ({ ...prev, email: location.state.email }));
        }
    }, [location]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.post('/api/auth/reset-password', formData);
            toast.success('Password reset successfully!');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reset password. Check your OTP.');
        } finally {
            setIsLoading(false);
        }
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
                        <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                        Secure Account Recovery
                    </div>
                    <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-4">
                        Set your new password securely.
                    </h1>
                    <p className="text-white/70 text-lg leading-relaxed mb-10">
                        Please enter the 6-digit OTP sent to your email to verify your identity.
                    </p>

                    <div className="space-y-4">
                        {[
                            { Icon: Shield, title: 'Enterprise Security', desc: 'Secure OTP email delivery' },
                            { Icon: Zap, title: 'Lightning Fast', desc: 'Instant password reset' },
                            { Icon: Star, title: 'Event-Driven', desc: 'Real-time notifications' },
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
                    © 2026 ShopEase Inc. Built with Microservices Architecture.
                </div>
            </div>

            {/* ── Right: Reset Password Form ── */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-16">
                <div className="lg:hidden flex items-center gap-2 mb-8">
                    <ShoppingBag className="w-6 h-6 text-primary-400" />
                    <span className="text-xl font-bold text-white">ShopEase</span>
                </div>

                <div className="w-full max-w-md animate-slide-up">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-white mb-2">Reset Password</h2>
                        <p className="text-slate-400 text-sm">
                            Enter the OTP from your email and set a new password.
                        </p>
                    </div>

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
                                    readOnly={!!location.state?.email}
                                />
                            </div>
                        </div>

                        {/* OTP */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Verification Code (OTP)</label>
                            <div className="relative">
                                <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    name="otp"
                                    type="text"
                                    required
                                    placeholder="123456"
                                    value={formData.otp}
                                    onChange={handleChange}
                                    className="input-dark pl-10"
                                    maxLength={6}
                                />
                            </div>
                        </div>

                        {/* New Password */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    name="newPassword"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    placeholder="••••••••"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    className="input-dark pl-10 pr-10"
                                    minLength={6}
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
                            disabled={isLoading || !formData.otp || !formData.newPassword || !formData.email}
                            className="btn-primary w-full py-3 mt-4"
                        >
                            {isLoading ? (
                                <span className="spinner w-4 h-4"></span>
                            ) : (
                                <>Verify & Reset <ArrowRight className="w-4 h-4" /></>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-slate-400 text-sm mt-8">
                        Wait, I remember it!{' '}
                        <Link to="/login" className="text-primary-400 font-semibold hover:text-primary-300">
                            Back to sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
