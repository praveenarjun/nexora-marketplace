import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowRight, Mail, ShoppingBag, Shield, Zap, Star } from 'lucide-react';
import api from '../services/api';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.post('/api/auth/forgot-password', { email });
            setIsSent(true);
            toast.success('OTP sent to your email!');
            // After 3 seconds, redirect to reset password page carrying the email
            setTimeout(() => {
                navigate('/reset-password', { state: { email } });
            }, 3000);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send OTP. Please try again.');
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
                        Regain access to your account securely.
                    </h1>
                    <p className="text-white/70 text-lg leading-relaxed mb-10">
                        We use encrypted OTP verification to ensure you and only you can recover your account.
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

            {/* ── Right: Forgot Password Form ── */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-16">
                <div className="lg:hidden flex items-center gap-2 mb-8">
                    <ShoppingBag className="w-6 h-6 text-primary-400" />
                    <span className="text-xl font-bold text-white">ShopEase</span>
                </div>

                <div className="w-full max-w-md animate-slide-up">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-white mb-2">Forgot Password</h2>
                        <p className="text-slate-400 text-sm">
                            Enter your email address and we'll send you a One-Time Password to reset your security credentials.
                        </p>
                    </div>

                    {isSent ? (
                        <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl text-sm mb-6 flex text-center flex-col items-center">
                            <Mail className="w-12 h-12 mb-3 text-green-400" />
                            <p className="font-semibold mb-1">Check your inbox</p>
                            <p className="text-green-500/80">We sent an OTP to {email}. Redirecting you to enter it...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Email address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        type="email"
                                        required
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="input-dark pl-10"
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || !email}
                                className="btn-primary w-full py-3 mt-4"
                            >
                                {isLoading ? (
                                    <span className="spinner w-4 h-4"></span>
                                ) : (
                                    <>Send Reset OTP <ArrowRight className="w-4 h-4" /></>
                                )}
                            </button>
                        </form>
                    )}

                    <p className="text-center text-slate-400 text-sm mt-8">
                        Remember your password?{' '}
                        <Link to="/login" className="text-primary-400 font-semibold hover:text-primary-300">
                            Back to sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
