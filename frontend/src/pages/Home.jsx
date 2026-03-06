import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Home() {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [loadingCategories, setLoadingCategories] = useState(true);

    // Helper for category images
    const getCategoryImage = (name) => {
        const lower = name?.toLowerCase() || '';
        if (lower.includes('elect')) return 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=800';
        if (lower.includes('fashion')) return 'https://images.unsplash.com/photo-1445205170230-053b83e26dd7?auto=format&fit=crop&q=80&w=800';
        if (lower.includes('home') || lower.includes('living')) return 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&q=80&w=800';
        if (lower.includes('fit') || lower.includes('outdoor')) return 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800';
        return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800';
    };

    useEffect(() => {
        // Fetch Featured Products
        api.get('/api/products/featured')
            .then(res => {
                const data = res.data?.data?.content || res.data?.data || [];
                setFeaturedProducts(Array.isArray(data) ? data.slice(0, 4) : []);
            })
            .catch(() => setFeaturedProducts([]))
            .finally(() => setLoadingProducts(false));

        // Fetch Categories with Dynamic Counts (Using specialized endpoint if available, else generic)
        api.get('/api/categories')
            .then(res => {
                const data = res.data?.data || res.data || [];
                const mapped = Array.isArray(data) ? data.map(cat => ({
                    name: cat.name,
                    count: 'View Collection',
                    img: cat.imageUrl || getCategoryImage(cat.name)
                })) : [];
                setCategories(mapped.slice(0, 4));
            })
            .catch(() => setCategories([]))
            .finally(() => setLoadingCategories(false));
    }, []);

    return (
        <div className="min-h-screen">
            {/* ── Hero card section from Stitch ── */}
            <section className="px-6 lg:px-12 pt-8 pb-12">
                <div
                    className="max-w-7xl mx-auto relative rounded-[40px] overflow-hidden bg-[var(--bg-tertiary)] border border-[var(--border-primary)] min-h-[600px] flex items-center px-12 lg:px-20 shadow-2xl bg-cover bg-center"
                    style={{ backgroundImage: 'linear-gradient(to bottom right, var(--bg-glass), var(--bg-glass)), url("/images/hero_bg.png")' }}
                >
                    {/* Visual ambient glows inside the card */}
                    <div className="absolute inset-0 z-0 opacity-30">
                        <div className="absolute -top-20 -left-20 w-96 h-96 bg-[#576ee0]/20 rounded-full blur-[120px]"></div>
                        <div className="absolute -bottom-20 -right-20 w-[500px] h-[500px] bg-[#576ee0]/10 rounded-full blur-[150px]"></div>
                    </div>

                    <div className="relative z-10 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--bg-glass)] border border-[var(--border-primary)] text-[10px] font-black tracking-[0.2em] uppercase mb-8 text-[var(--primary-color)]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary-color)] animate-pulse"></span>
                            New Collection 2024
                        </div>

                        <h1 className="text-6xl lg:text-8xl font-black mb-8 leading-[1.1] tracking-tighter text-adaptive font-serif italic">
                            Elevate Your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-indigo-500">Lifestyle.</span>
                        </h1>

                        <p className="text-[var(--text-secondary)] text-lg lg:text-xl mb-10 max-w-xl leading-relaxed font-medium">
                            Discover our meticulously curated collection of premium electronics,
                            designer goods, and smart living essentials.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <Link to="/products" className="w-full sm:w-auto bg-primary-500 px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs text-white hover:bg-primary-600 transition-all shadow-xl shadow-primary-500/20 active:scale-95">
                                Shop Collection
                            </Link>
                            <button className="w-full sm:w-auto bg-[var(--bg-glass)] border border-[var(--border-primary)] px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs text-adaptive hover:bg-[var(--bg-secondary)] transition-all backdrop-blur-md">
                                Discover More
                            </button>
                        </div>
                    </div>

                    {/* Premium Product Image Showcase */}
                    <div className="hidden lg:block absolute right-10 bottom-0 w-[450px] pointer-events-none">
                        <div className="relative animate-float transition-all duration-1000">
                            <img
                                src="/images/hero_product.png"
                                alt="Hero Showcase"
                                className="w-full drop-shadow-[0_35px_35px_rgba(87,110,224,0.3)] filter brightness-110 contrast-125"
                            />
                            {/* Ambient Glow behind image */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary-500/20 blur-[100px] -z-10 rounded-full"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Shop by Category ── */}
            <section className="py-20 px-6 max-w-7xl mx-auto">
                <div className="flex items-end justify-between mb-10">
                    <div>
                        <h2 className="text-4xl font-black text-[var(--text-primary)] tracking-tighter mb-2">Shop by Category</h2>
                        <p className="text-[var(--text-muted)] font-medium">Find exactly what you need from our curated collections.</p>
                    </div>
                    <Link to="/products" className="text-[var(--primary-color)] font-bold hover:text-[var(--primary-hover)] transition-colors flex items-center gap-1 group">
                        View All
                        <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </Link>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {loadingCategories ? (
                        [1, 2, 3, 4].map(i => (
                            <div key={i} className="aspect-[4/5] rounded-3xl bg-[var(--bg-secondary)] animate-pulse"></div>
                        ))
                    ) : (
                        categories.map(cat => (
                            <Link key={cat.name} to={`/products?category=${encodeURIComponent(cat.name)}`} className="group relative aspect-[4/5] rounded-3xl overflow-hidden bg-[var(--bg-tertiary)] shadow-2xl transition-all hover:-translate-y-2 border border-[var(--border-primary)]">
                                <img src={cat.img} alt={cat.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-110 transition-all duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-transparent to-transparent"></div>
                                <div className="absolute bottom-6 left-6">
                                    <h3 className="text-xl font-black text-[var(--text-primary)] mb-1">{cat.name}</h3>
                                    <p className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-widest">{cat.count}</p>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </section>

            {/* ── Featured Products (Stitch Style) ── */}
            <section className="py-24 bg-[var(--bg-primary)]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col mb-12">
                        <h2 className="text-4xl font-black text-[var(--text-primary)] tracking-tighter mb-2">Featured Products</h2>
                        <div className="w-20 h-1.5 bg-[var(--primary-color)] rounded-full"></div>
                    </div>

                    {loadingProducts ? (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-[450px] rounded-3xl bg-[var(--bg-secondary)] animate-pulse"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {featuredProducts.map(product => (
                                <div key={product.id} className="group flex flex-col relative">
                                    <Link to={`/products/${product.id}`} className="relative aspect-[4/5] rounded-[32px] overflow-hidden bg-[var(--bg-tertiary)] mb-6 shadow-2xl transition-all hover:shadow-[var(--primary-color)]/10 active:scale-95 border border-[var(--border-primary)]">
                                        {/* Badge Overlay */}
                                        {product.badge && (
                                            <div className="absolute top-4 left-4 z-10">
                                                <span className="bg-primary-500 text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-[0.15em] shadow-xl">
                                                    {product.badge}
                                                </span>
                                            </div>
                                        )}

                                        {product.imageUrls?.[0] ? (
                                            <img src={product.imageUrls[0]} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-[var(--primary-color)]/10">
                                                <span className="material-symbols-outlined text-6xl text-[var(--primary-color)]/20">inventory_2</span>
                                            </div>
                                        )}
                                        {/* Favorite Overlay */}
                                        <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[var(--bg-glass)] backdrop-blur-md flex items-center justify-center text-[var(--text-primary)] hover:bg-[var(--primary-color)] hover:text-white transition-colors">
                                            <span className="material-symbols-rounded text-xl">favorite</span>
                                        </button>
                                    </Link>

                                    <div className="px-2">
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">{product.categoryName || 'COLLECTION'}</p>
                                            {product.rating > 0 && (
                                                <div className="flex items-center gap-1">
                                                    <span className="material-symbols-rounded text-[14px] text-amber-500">star</span>
                                                    <span className="text-[10px] font-bold text-[var(--text-muted)]">{product.rating}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-start justify-between">
                                            <Link to={`/products/${product.id}`} className="text-lg font-bold text-[var(--text-primary)] hover:text-[var(--primary-color)] transition-colors truncate pr-4">{product.name}</Link>
                                            <span className="text-lg font-black text-[var(--text-primary)]">₹{product.price?.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* ── Newsletter CTA (Stitch Detail) ── */}
            <section className="py-24 px-6">
                <div className="max-w-5xl mx-auto bg-gradient-to-br from-[var(--bg-tertiary)] to-[var(--bg-primary)] rounded-[48px] p-12 lg:p-20 text-center border border-[var(--border-primary)] relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--primary-color)]/10 rounded-full blur-[100px]"></div>
                    <div className="relative z-10">
                        <h2 className="text-4xl lg:text-5xl font-black text-[var(--text-primary)] tracking-tighter mb-6 leading-tight">Join the ShopEase Circle</h2>
                        <p className="text-[var(--text-muted)] text-lg mb-10 max-w-xl mx-auto">Get early access to drops, exclusive discounts, and lifestyle tips.</p>
                        <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto" onSubmit={(e) => e.preventDefault()}>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl px-6 py-4 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/50 placeholder:text-[var(--text-muted)]"
                            />
                            <button className="bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] text-white font-black uppercase tracking-widest px-10 py-4 rounded-2xl transition-all shadow-xl shadow-[var(--primary-color)]/30 active:scale-95">
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
}
