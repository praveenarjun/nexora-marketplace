import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, ShieldCheck, Zap, Clock, Star, TrendingUp, Package } from 'lucide-react';
import api from '../services/api';

const CATEGORY_ICONS = ['📱', '💻', '🎧', '⌚', '📷', '🖥️'];

export default function Home() {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);

    useEffect(() => {
        api.get('/api/products/featured')
            .then(res => {
                const data = res.data?.data?.content || res.data?.data || [];
                setFeaturedProducts(Array.isArray(data) ? data.slice(0, 4) : []);
            })
            .catch(() => setFeaturedProducts([]))
            .finally(() => setLoadingProducts(false));
    }, []);

    const stats = [
        { label: 'Products', value: '500+', icon: Package },
        { label: 'Happy Customers', value: '10K+', icon: Star },
        { label: 'Uptime', value: '99.9%', icon: TrendingUp },
    ];

    const features = [
        {
            icon: ShieldCheck,
            title: 'Circuit Breaker Enabled',
            desc: 'Built-in Resilience4j fallbacks keep the platform resilient even when microservices fail.',
        },
        {
            icon: Zap,
            title: 'Event-Driven Logistics',
            desc: 'RabbitMQ messaging coordinates ordering, inventory allocation, and notifications async.',
        },
        {
            icon: Clock,
            title: 'Redis-Powered Cache',
            desc: 'Lightning-fast product lookups powered by Upstash Redis distributed cache.',
        },
    ];

    const categories = [
        { name: 'Electronics', emoji: '📱', desc: 'Phones, laptops, tablets' },
        { name: 'Audio', emoji: '🎧', desc: 'Headphones, speakers' },
        { name: 'Computing', emoji: '💻', desc: 'PCs, accessories' },
        { name: 'Wearables', emoji: '⌚', desc: 'Smartwatches, fitness' },
    ];

    return (
        <div className="min-h-screen">
            {/* ── Hero ── */}
            <section className="relative overflow-hidden py-24 sm:py-32 px-4">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: '#6366f1' }}></div>
                    <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-8 blur-3xl" style={{ background: '#4f46e5' }}></div>
                </div>

                <div className="relative max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8 border"
                        style={{ background: 'rgba(99,102,241,0.1)', borderColor: 'rgba(99,102,241,0.3)', color: '#a5b4fc' }}>
                        <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse"></span>
                        Microservices Architecture · Spring Boot · RabbitMQ · Redis
                    </div>

                    <h1 className="text-5xl sm:text-7xl font-extrabold leading-tight tracking-tight mb-6">
                        <span className="text-white">Elevate</span>{' '}
                        <span className="gradient-text">Your Lifestyle.</span>
                    </h1>
                    <p className="text-slate-400 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
                        A high-performance e-commerce platform built on distributed Spring Boot microservices,
                        connected by resilient API gateways and message queues.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/products" className="btn-primary px-8 py-4 text-base">
                            <ShoppingBag className="w-5 h-5" />
                            Browse Catalog
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <Link to="/register" className="btn-secondary px-8 py-4 text-base">
                            Create Account
                        </Link>
                    </div>

                    {/* Stats */}
                    <div className="flex justify-center gap-12 mt-16">
                        {stats.map(({ label, value, icon: Icon }) => (
                            <div key={label} className="text-center">
                                <div className="text-3xl font-extrabold gradient-text-blue">{value}</div>
                                <div className="text-slate-500 text-sm mt-1">{label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Categories ── */}
            <section className="py-16 px-4 max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Shop by Category</h2>
                        <p className="text-slate-500 text-sm mt-1">Explore our curated collections</p>
                    </div>
                    <Link to="/products" className="text-primary-400 text-sm font-medium hover:text-primary-300 flex items-center gap-1">
                        View all <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {categories.map((cat) => (
                        <Link
                            key={cat.name}
                            to={`/products?search=${cat.name.toLowerCase()}`}
                            className="glass-card-hover p-6 text-center group cursor-pointer"
                        >
                            <div className="text-4xl mb-3">{cat.emoji}</div>
                            <div className="font-semibold text-white text-sm">{cat.name}</div>
                            <div className="text-slate-500 text-xs mt-1">{cat.desc}</div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* ── Featured Products ── */}
            <section className="py-16 px-4 max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Featured Products</h2>
                        <p className="text-slate-500 text-sm mt-1">Our top picks this season</p>
                    </div>
                    <Link to="/products" className="text-primary-400 text-sm font-medium hover:text-primary-300 flex items-center gap-1">
                        View all <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {loadingProducts ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="glass-card h-64 animate-pulse">
                                <div className="h-3/5 rounded-t-2xl bg-white/5"></div>
                                <div className="p-4 space-y-2">
                                    <div className="h-3 bg-white/5 rounded w-3/4"></div>
                                    <div className="h-3 bg-white/5 rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : featuredProducts.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {featuredProducts.map((product) => (
                            <Link
                                key={product.id}
                                to={`/products/${product.id}`}
                                className="glass-card-hover overflow-hidden group"
                            >
                                <div className="aspect-square bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center rounded-t-2xl">
                                    {product.imageUrls?.[0] ? (
                                        <img src={product.imageUrls[0]} alt={product.name} className="w-full h-full object-cover rounded-t-2xl" />
                                    ) : (
                                        <span className="text-5xl">
                                            {CATEGORY_ICONS[product.categoryId % CATEGORY_ICONS.length] || '📦'}
                                        </span>
                                    )}
                                </div>
                                <div className="p-4">
                                    <div className="font-semibold text-white text-sm truncate">{product.name}</div>
                                    <div className="text-primary-400 font-bold mt-1">₹{product.price?.toLocaleString()}</div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="glass-card p-16 text-center">
                        <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-white mb-2">Explore our catalog</h3>
                        <p className="text-slate-500 text-sm mb-6">Browse our full collection of premium products</p>
                        <Link to="/products" className="btn-primary px-6 py-2.5 text-sm">Go to Catalog</Link>
                    </div>
                )}
            </section>

            {/* ── Features ── */}
            <section className="py-16 px-4 max-w-7xl mx-auto section-divider">
                <div className="text-center mb-12">
                    <h2 className="text-2xl font-bold text-white">Built for Scale</h2>
                    <p className="text-slate-500 text-sm mt-2">Enterprise-grade microservices architecture</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {features.map(({ icon: Icon, title, desc }) => (
                        <div key={title} className="glass-card p-6">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                                style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' }}>
                                <Icon className="w-6 h-6 text-primary-400" />
                            </div>
                            <h3 className="font-bold text-white mb-2">{title}</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── CTA Banner ── */}
            <section className="py-16 px-4 max-w-7xl mx-auto">
                <div className="rounded-3xl p-12 text-center relative overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)' }}>
                    <div className="absolute inset-0 opacity-20"
                        style={{ background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.15) 0%, transparent 60%)' }}></div>
                    <div className="relative z-10">
                        <h2 className="text-3xl font-extrabold text-white mb-4">Ready to start shopping?</h2>
                        <p className="text-indigo-200 mb-8 max-w-xl mx-auto">
                            Join ShopEase and experience next-generation e-commerce powered by microservices.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/register" className="px-8 py-3 rounded-xl font-semibold text-indigo-900 bg-white hover:bg-indigo-50 transition-colors">
                                Get Started Free
                            </Link>
                            <Link to="/products" className="px-8 py-3 rounded-xl font-semibold text-white border border-white/30 hover:bg-white/10 transition-colors">
                                Browse Products
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-4 section-divider mt-8">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-primary-400" />
                        <span className="text-slate-400 text-sm">ShopEase — Microservices E-Commerce</span>
                    </div>
                    <div className="text-slate-600 text-xs">© 2024 ShopEase Inc. Built with Spring Boot & React.</div>
                </div>
            </footer>
        </div>
    );
}
