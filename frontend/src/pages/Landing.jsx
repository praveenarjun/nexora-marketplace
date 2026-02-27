import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Star, Zap, Shield, Package, ChevronDown, Sparkles } from 'lucide-react';

// Animated particle background
function ParticleField() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;
        let animId;

        const particles = Array.from({ length: 60 }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            r: Math.random() * 1.5 + 0.5,
            dx: (Math.random() - 0.5) * 0.3,
            dy: (Math.random() - 0.5) * 0.3,
            alpha: Math.random() * 0.5 + 0.1,
        }));

        const draw = () => {
            ctx.clearRect(0, 0, width, height);
            particles.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(99,102,241,${p.alpha})`;
                ctx.fill();
                p.x += p.dx;
                p.y += p.dy;
                if (p.x < 0 || p.x > width) p.dx *= -1;
                if (p.y < 0 || p.y > height) p.dy *= -1;
            });
            animId = requestAnimationFrame(draw);
        };

        draw();

        const onResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', onResize);

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', onResize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 0,
            }}
        />
    );
}

const features = [
    { icon: Zap, title: 'Lightning Fast', desc: 'Redis-cached catalog with sub-100ms response times' },
    { icon: Shield, title: 'Enterprise Security', desc: 'JWT auth with role-based access control' },
    { icon: Package, title: 'Real-time Inventory', desc: 'Event-driven stock management via RabbitMQ' },
    { icon: Star, title: 'Resilient Design', desc: 'Circuit breakers keep the platform online 24/7' },
];

const brands = ['Samsung', 'Apple', 'Sony', 'LG', 'Bose', 'Dell'];

export default function Landing() {
    const navigate = useNavigate();

    const goToLogin = (e) => {
        e.preventDefault();
        navigate('/login');
    };

    return (
        <div className="min-h-screen relative" style={{ background: '#000000' }}>
            <ParticleField />

            {/* Navbar */}
            <nav className="navbar-glass fixed top-0 left-0 right-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                            <ShoppingBag className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-lg font-bold gradient-text">ShopEase</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-6">
                        <a onClick={goToLogin} href="#" className="text-slate-400 hover:text-white text-sm transition-colors">Products</a>
                        <a onClick={goToLogin} href="#" className="text-slate-400 hover:text-white text-sm transition-colors">Deals</a>
                        <a onClick={goToLogin} href="#" className="text-slate-400 hover:text-white text-sm transition-colors">About</a>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link to="/login" className="text-slate-300 hover:text-white text-sm font-medium transition-colors">Log in</Link>
                        <Link to="/register" className="btn-primary px-4 py-2 text-sm">Get Started</Link>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-4 pt-16">
                {/* Background glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none"
                    style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)' }} />

                <div className="animate-slide-up max-w-5xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8 border"
                        style={{ background: 'rgba(99,102,241,0.1)', borderColor: 'rgba(99,102,241,0.3)', color: '#a5b4fc' }}>
                        <Sparkles className="w-4 h-4" />
                        Powered by Spring Boot Microservices
                    </div>

                    <h1 className="text-6xl sm:text-8xl font-black leading-none tracking-tight mb-6">
                        <span className="text-white">Shop</span>
                        <span className="gradient-text">Ease</span>
                        <br />
                        <span className="text-white text-4xl sm:text-6xl font-extrabold">Premium E-Commerce</span>
                    </h1>

                    <p className="text-slate-400 text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
                        Experience the next generation of shopping. Discover premium products,
                        seamless checkout, and real-time order tracking — all powered by cloud-native architecture.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                        <Link to="/register" className="btn-primary px-8 py-4 text-base">
                            Start Shopping Free <ArrowRight className="w-5 h-5" />
                        </Link>
                        <Link to="/login" className="btn-secondary px-8 py-4 text-base">
                            Sign In
                        </Link>
                    </div>

                    {/* Trusted brands */}
                    <div className="flex flex-wrap justify-center gap-6 mb-8">
                        {brands.map(b => (
                            <span key={b} className="text-slate-600 text-sm font-semibold tracking-widest uppercase">{b}</span>
                        ))}
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 animate-bounce">
                    <ChevronDown className="w-6 h-6 text-slate-600" />
                </div>
            </section>

            {/* Stats */}
            <section className="relative z-10 py-16 px-4 section-divider">
                <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
                    {[
                        { value: '500+', label: 'Products' },
                        { value: '10K+', label: 'Customers' },
                        { value: '99.9%', label: 'Uptime' },
                        { value: '<100ms', label: 'Response' },
                    ].map(({ value, label }) => (
                        <div key={label} className="glass-card p-6">
                            <div className="text-3xl font-extrabold gradient-text-blue mb-1">{value}</div>
                            <div className="text-slate-500 text-sm">{label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features */}
            <section className="relative z-10 py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-white mb-3">Built Different</h2>
                        <p className="text-slate-500">Not just an e-commerce store. An engineering showcase.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {features.map(({ icon: Icon, title, desc }) => (
                            <div key={title} className="glass-card-hover p-6 text-center">
                                <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                                    style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}>
                                    <Icon className="w-6 h-6 text-primary-400" />
                                </div>
                                <h3 className="font-bold text-white mb-2 text-sm">{title}</h3>
                                <p className="text-slate-500 text-xs leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Banner */}
            <section className="relative z-10 py-20 px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <div className="rounded-3xl p-12 relative overflow-hidden"
                        style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)' }}>
                        <div className="absolute inset-0 opacity-30"
                            style={{ background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.15), transparent 60%)' }} />
                        <div className="relative z-10">
                            <h2 className="text-4xl font-extrabold text-white mb-4">Ready to shop?</h2>
                            <p className="text-indigo-200 mb-8 max-w-lg mx-auto">
                                Create your free account and start exploring 500+ premium products today.
                            </p>
                            <Link to="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-900 font-bold rounded-xl hover:bg-indigo-50 transition-colors">
                                Create Free Account <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 py-8 px-4 section-divider">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-primary-400" />
                        <span className="text-slate-500 text-sm">ShopEase © 2024 — Built with Spring Boot Microservices</span>
                    </div>
                    <div className="flex gap-6">
                        <Link to="/login" className="text-slate-600 hover:text-slate-400 text-xs">Sign In</Link>
                        <Link to="/register" className="text-slate-600 hover:text-slate-400 text-xs">Register</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
