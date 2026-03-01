import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import useCart from '../hooks/useCart';

export default function Products() {
    const cart = useCart();
    const [searchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [sortBy, setSortBy] = useState('NEWEST');
    const [priceRange, setPriceRange] = useState(500000); // 5L max for electronics
    const [addedIds, setAddedIds] = useState(new Set());

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/api/products');
            const content = Array.isArray(response.data)
                ? response.data
                : response.data?.data?.content || response.data?.content || [];
            setProducts(content);
        } catch (err) {
            setError(err.response?.status === 503
                ? 'The catalog service is warming up. Please refresh in 60 seconds.'
                : 'Failed to load products. Please try again.');
            toast.error('Could not load products');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = (e, product) => {
        e.preventDefault();
        e.stopPropagation();
        cart.addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            sku: product.sku,
            quantity: 1,
        });
        setAddedIds(prev => new Set([...prev, product.id]));
        toast.success(`${product.name} added to cart`);
        setTimeout(() => setAddedIds(prev => { const s = new Set(prev); s.delete(product.id); return s; }), 1500);
    };

    const categories = ['ALL', ...new Set(products.map(p => p.categoryName).filter(Boolean))];

    const filtered = products
        .filter(p => !searchTerm || p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku?.toLowerCase().includes(searchTerm.toLowerCase()))
        .filter(p => selectedCategory === 'ALL' || p.categoryName === selectedCategory)
        .filter(p => p.price <= priceRange)
        .sort((a, b) => {
            if (sortBy === 'PRICE_ASC') return a.price - b.price;
            if (sortBy === 'PRICE_DESC') return b.price - a.price;
            if (sortBy === 'NAME') return a.name?.localeCompare(b.name);
            return b.id - a.id;
        });

    return (
        <div className="max-w-7xl mx-auto w-full px-6 py-12">
            <div className="flex flex-col md:flex-row gap-10">
                {/* Sidebar Filters */}
                <aside className="w-full md:w-64 flex-shrink-0 space-y-10">
                    <div>
                        <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary-500">filter_list</span>
                            Filters
                        </h3>

                        {/* Category Filter */}
                        <div className="space-y-4 mb-8">
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Category</p>
                            <div className="space-y-1">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${selectedCategory === cat
                                            ? 'bg-primary-500/10 text-primary-500 font-bold'
                                            : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                                            }`}
                                    >
                                        <span className="text-sm">{cat === 'ALL' ? 'All Products' : cat}</span>
                                        <span className="text-[10px] font-bold opacity-50">
                                            {cat === 'ALL' ? products.length : products.filter(p => p.categoryName === cat).length}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Price Range Filter */}
                        <div className="space-y-4">
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Price Range</p>
                            <div className="px-1">
                                <input
                                    type="range"
                                    min="0"
                                    max="500000"
                                    step="1000"
                                    value={priceRange}
                                    onChange={e => setPriceRange(parseInt(e.target.value))}
                                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary-500"
                                />
                                <div className="flex justify-between mt-3 text-[10px] font-bold text-slate-500 uppercase">
                                    <span>₹0</span>
                                    <span>₹{priceRange.toLocaleString()}+</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <section className="flex-1">
                    {/* Header & Search */}
                    <div className="mb-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
                                <Link to="/home" className="hover:text-primary-500">Home</Link>
                                <span className="material-symbols-outlined text-[10px]">chevron_right</span>
                                <span className="text-primary-500">Marketplace</span>
                            </div>
                            <h1 className="text-4xl font-black text-white tracking-tight">Catalog</h1>
                            <p className="text-slate-500 text-sm mt-1">Premium hardware optimized for distributed systems.</p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-3">
                            <div className="relative flex-1 sm:w-64">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">search</span>
                                <input
                                    type="text"
                                    placeholder="Search catalog..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
                                />
                            </div>
                            <select
                                value={sortBy}
                                onChange={e => setSortBy(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 cursor-pointer"
                            >
                                <option value="NEWEST" className="bg-[#121420]">Sort: Newest</option>
                                <option value="PRICE_ASC" className="bg-[#121420]">Price: Low to High</option>
                                <option value="PRICE_DESC" className="bg-[#121420]">Price: High to Low</option>
                                <option value="NAME" className="bg-[#121420]">Name: A-Z</option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="h-80 bg-white/5 border border-white/10 rounded-2xl animate-pulse"></div>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-16 text-center">
                            <span className="material-symbols-outlined text-6xl text-slate-700 mb-4">error</span>
                            <p className="text-slate-400 font-medium">{error}</p>
                            <button onClick={fetchProducts} className="mt-6 bg-primary-500 px-8 py-3 rounded-xl font-bold text-white hover:bg-primary-600 transition-all">Retry Connection</button>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-16 text-center">
                            <span className="material-symbols-outlined text-6xl text-slate-700 mb-4">search_off</span>
                            <h3 className="text-white font-bold text-xl mb-2">No components found</h3>
                            <p className="text-slate-500">Try adjusting your search or filters to find what you need.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filtered.map(product => (
                                <Link
                                    key={product.id}
                                    to={`/products/${product.id}`}
                                    className="group flex flex-col bg-[#1c1d26] border border-white/5 rounded-[32px] overflow-hidden hover:border-primary-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary-500/10"
                                >
                                    <div className="aspect-square relative overflow-hidden bg-[#0a0b10]">
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
                                            <div className="w-full h-full flex items-center justify-center bg-primary-500/10">
                                                <span className="material-symbols-outlined text-6xl text-primary-500/30">inventory_2</span>
                                            </div>
                                        )}

                                        {!product.inStock && (
                                            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                                                <span className="bg-red-500/10 border border-red-500/30 text-red-500 text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest">Out of Stock</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-6 flex flex-col flex-1">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex flex-col gap-1">
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{product.categoryName || 'GENERAL'}</p>
                                                <h3 className="font-bold text-white group-hover:text-primary-400 transition-colors truncate pr-4">{product.name}</h3>
                                            </div>
                                            {product.rating > 0 && (
                                                <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg">
                                                    <span className="material-symbols-rounded text-sm text-amber-400">star</span>
                                                    <span className="text-[10px] font-bold text-slate-300">{product.rating}</span>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-400 mb-6 line-clamp-2 leading-relaxed font-medium">{product.description}</p>
                                        <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                                            <span className="text-xl font-black text-white">₹{product.price?.toLocaleString()}</span>
                                            <button
                                                disabled={!product.inStock || addedIds.has(product.id)}
                                                onClick={(e) => handleAddToCart(e, product)}
                                                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${addedIds.has(product.id)
                                                    ? 'bg-green-500 text-white scale-110 shadow-lg shadow-green-500/20'
                                                    : 'bg-primary-500 text-white hover:bg-primary-600 shadow-lg shadow-primary-500/20 active:scale-95'
                                                    }`}
                                            >
                                                <span className="material-symbols-outlined text-xl">
                                                    {addedIds.has(product.id) ? 'check' : 'shopping_cart'}
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
