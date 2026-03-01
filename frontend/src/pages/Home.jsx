import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

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

    return (
        <div className="min-h-screen">
            {/* ── Hero card section from Stitch ── */}
            <section className="px-6 lg:px-12 pt-8 pb-12">
                <div className="max-w-7xl mx-auto relative rounded-[40px] overflow-hidden bg-gradient-to-br from-[#1c1d26] to-[#0a0b10] border border-white/5 min-h-[600px] flex items-center px-12 lg:px-20 shadow-2xl">
                    {/* Visual ambient glows inside the card */}
                    <div className="absolute inset-0 z-0 opacity-30">
                        <div className="absolute -top-20 -left-20 w-96 h-96 bg-[#576ee0]/20 rounded-full blur-[120px]"></div>
                        <div className="absolute -bottom-20 -right-20 w-[500px] h-[500px] bg-[#576ee0]/10 rounded-full blur-[150px]"></div>
                    </div>

                    <div className="relative z-10 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black tracking-[0.2em] uppercase mb-8 text-primary-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse"></span>
                            New Collection 2024
                        </div>

                        <h1 className="text-6xl lg:text-8xl font-black mb-8 leading-[1.1] tracking-tighter text-white font-serif italic">
                            Elevate Your <span className="text-primary-400 not-italic">Lifestyle.</span>
                        </h1>

                        <p className="text-slate-400 text-lg lg:text-xl mb-10 max-w-xl leading-relaxed font-medium">
                            Discover our meticulously curated collection of premium electronics,
                            designer goods, and smart living essentials.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <Link to="/products" className="w-full sm:w-auto bg-primary-500 px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs text-white hover:bg-primary-600 transition-all shadow-xl shadow-primary-500/20 active:scale-95">
                                Shop Collection
                            </Link>
                            <button className="w-full sm:w-auto bg-white/5 border border-white/10 px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs text-white hover:bg-white/10 transition-all backdrop-blur-md">
                                View Lookbook
                            </button>
                        </div>
                    </div>

                    {/* Decorative floating element (Stitch style) */}
                    <div className="hidden lg:block absolute right-20 bottom-0 w-1/3 h-4/5">
                        <div className="w-full h-full bg-gradient-to-t from-black/40 to-transparent rounded-t-[40px] border-x border-t border-white/5 backdrop-blur-sm relative overflow-hidden">
                            <div className="absolute inset-0 bg-primary-500/5"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Shop by Category ── */}
            <section className="py-20 px-6 max-w-7xl mx-auto">
                <div className="flex items-end justify-between mb-10">
                    <div>
                        <h2 className="text-4xl font-black text-white tracking-tighter mb-2">Shop by Category</h2>
                        <p className="text-slate-500 font-medium">Find exactly what you need from our curated collections.</p>
                    </div>
                    <Link to="/products" className="text-primary-400 font-bold hover:text-primary-300 transition-colors flex items-center gap-1 group">
                        View All
                        <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </Link>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { name: 'Electronics', img: 'https://images.unsplash.com/photo-1546868889-4e0ca25e2154?auto=format&fit=crop&q=80&w=800', count: '1.2k+ Products' },
                        { name: 'Fashion', img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800', count: '850+ Products' },
                        { name: 'Home Decor', img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800', count: '420+ Products' },
                        { name: 'Gadgets', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800', count: '600+ Products' }
                    ].map(cat => (
                        <Link key={cat.name} to={`/products?category=${cat.name.toLowerCase()}`} className="group relative aspect-[4/5] rounded-3xl overflow-hidden bg-slate-900 shadow-2xl transition-all hover:-translate-y-2">
                            <img src={cat.img} alt={cat.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-110 transition-all duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b10] via-transparent to-transparent"></div>
                            <div className="absolute bottom-6 left-6">
                                <h3 className="text-xl font-black text-white mb-1">{cat.name}</h3>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{cat.count}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* ── Featured Products (Stitch Style) ── */}
            <section className="py-24 bg-[#0d0e14]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black text-white tracking-tighter mb-4">Featured Products</h2>
                        <div className="w-20 h-1 bg-primary-500 mx-auto rounded-full"></div>
                    </div>

                    {loadingProducts ? (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-[450px] rounded-3xl bg-white/5 animate-pulse"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {featuredProducts.map(product => (
                                <div key={product.id} className="group flex flex-col">
                                    <Link to={`/products/${product.id}`} className="relative aspect-[4/5] rounded-[32px] overflow-hidden bg-[#1c1d26] mb-6 shadow-2xl transition-all hover:shadow-primary-500/10 active:scale-95">
                                        {product.imageUrls?.[0] ? (
                                            <img src={product.imageUrls[0]} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-primary-500/10">
                                                <span className="material-symbols-outlined text-6xl text-primary-500/20">inventory_2</span>
                                            </div>
                                        )}
                                        {/* Favorite Overlay */}
                                        <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#0a0b10]/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-primary-500 transition-colors">
                                            <span className="material-symbols-rounded text-xl">favorite</span>
                                        </button>
                                    </Link>

                                    <div className="px-2">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">{product.category || 'MICROSERVICE'}</p>
                                        <div className="flex items-start justify-between">
                                            <Link to={`/products/${product.id}`} className="text-lg font-bold text-white hover:text-primary-400 transition-colors truncate pr-4">{product.name}</Link>
                                            <span className="text-lg font-black text-white">₹{product.price?.toLocaleString()}</span>
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
                <div className="max-w-5xl mx-auto bg-gradient-to-br from-[#1c1d26] to-[#0a0b10] rounded-[48px] p-12 lg:p-20 text-center border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-[100px]"></div>
                    <div className="relative z-10">
                        <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tighter mb-6 leading-tight">Join the ShopEase Circle</h2>
                        <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">Get early access to drops, exclusive discounts, and lifestyle tips.</p>
                        <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto" onSubmit={(e) => e.preventDefault()}>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                            />
                            <button className="bg-primary-500 hover:bg-primary-600 text-white font-black uppercase tracking-widest px-10 py-4 rounded-2xl transition-all shadow-xl shadow-primary-500/30 active:scale-95">
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
}
