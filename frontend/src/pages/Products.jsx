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
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'ALL');
    const [sortBy, setSortBy] = useState('NEWEST');
    const [priceRange, setPriceRange] = useState(500000); // 5L max for electronics
    const [addedIds, setAddedIds] = useState(new Set());
    const [showFilters, setShowFilters] = useState(false);

    // Standardized Category Imagery
    const getCategoryImage = (name) => {
        const lower = name?.toLowerCase() || '';
        if (lower.includes('elect')) return 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=800';
        if (lower.includes('fashion')) return 'https://images.unsplash.com/photo-1445205170230-053b83e26dd7?auto=format&fit=crop&q=80&w=800';
        if (lower.includes('home') || lower.includes('living')) return 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&q=80&w=800';
        if (lower.includes('fit') || lower.includes('outdoor')) return 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800';
        return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800';
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('📡 Fetching products from:', api.defaults.baseURL || 'relative', 'with search:', searchTerm);

            // Build params object dynamically to avoid sending "null" strings
            const params = {};
            if (searchTerm) params.search = searchTerm;

            const response = await api.get('/api/products', { params });
            console.log('✅ API Response received:', response.status);

            // Ultra-robust parsing logic
            let content = [];
            if (Array.isArray(response.data)) {
                content = response.data;
            } else if (response.data?.data?.content && Array.isArray(response.data.data.content)) {
                content = response.data.data.content;
            } else if (response.data?.content && Array.isArray(response.data.content)) {
                content = response.data.content;
            } else if (response.data?.data && Array.isArray(response.data.data)) {
                content = response.data.data;
            }

            console.log('📦 Parsed products count:', content.length);
            setProducts(content);
        } catch (err) {
            console.error('❌ Fetch failed:', err);
            setError(err.response?.status === 503
                ? 'The catalog service is warming up. Please refresh in 60 seconds.'
                : 'Failed to load products. Please check your connection.');
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
            if (sortBy === 'PRICE_ASC') return (a.price || 0) - (b.price || 0);
            if (sortBy === 'PRICE_DESC') return (b.price || 0) - (a.price || 0);
            if (sortBy === 'NAME') return (a.name || '').localeCompare(b.name || '');
            return b.id - a.id;
        });

    return (
        <div className="max-w-7xl mx-auto w-full px-6 py-12">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Mobile Filter Toggle */}
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="md:hidden w-full flex items-center justify-between p-4 bg-[var(--bg-glass)] border border-[var(--border-primary)] rounded-2xl mb-4"
                >
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary-500">tune</span>
                        <span className="font-bold text-adaptive">Filters & Refinement</span>
                    </div>
                    <span className="material-symbols-outlined transition-transform duration-300" style={{ transform: showFilters ? 'rotate(180deg)' : 'none' }}>expand_more</span>
                </button>

                {/* Sidebar Filters - Now Collapsible on Mobile */}
                <aside className={`w-full md:w-64 flex-shrink-0 ${showFilters ? 'block animate-fade-in' : 'hidden md:block'}`}>
                    <div className="md:sticky md:top-28 space-y-8">
                        {/* Category Filter */}
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-adaptive tracking-tight">Filters</h3>
                            <p className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">Category</p>
                        </div>
                        <div className="space-y-1">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${selectedCategory === cat
                                        ? 'bg-primary-500/10 text-primary-500 font-bold'
                                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-glass)] hover:text-[var(--text-primary)]'
                                        }`}
                                >
                                    <span className="text-sm">{cat === 'ALL' ? 'All Products' : cat}</span>
                                    <span className="text-[10px] font-bold opacity-50">
                                        {cat === 'ALL' ? products.length : products.filter(p => p.categoryName === cat).length}
                                    </span>
                                </button>
                            ))}
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
                                    className="w-full h-1.5 bg-[var(--border-primary)] rounded-lg appearance-none cursor-pointer accent-primary-500"
                                />
                                <div className="flex justify-between mt-3 text-[10px] font-bold text-[var(--text-muted)] uppercase">
                                    <span>₹0</span>
                                    <span>₹{priceRange.toLocaleString()}+</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <section className="flex-1">
                    {/* Header & Search - Condensed for Mobile */}
                    <div className="mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                        <div className="max-w-md">
                            <div className="flex items-center gap-2 text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-wider mb-2">
                                <Link to="/home" className="hover:text-primary-500">Home</Link>
                                <span className="material-symbols-outlined text-[8px]">chevron_right</span>
                                <span className="text-primary-500">Marketplace</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black text-adaptive tracking-tight">Catalog</h1>
                            <p className="text-[var(--text-secondary)] text-xs md:text-sm mt-1 font-medium">Premium hardware optimized for luxury living.</p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-2">
                            <div className="relative w-full sm:w-64">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">search</span>
                                <input
                                    type="text"
                                    placeholder="Search catalog..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl pl-10 pr-4 py-2 text-sm text-adaptive focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all placeholder:text-[var(--text-muted)] h-10"
                                />
                            </div>
                            <select
                                value={sortBy}
                                onChange={e => setSortBy(e.target.value)}
                                className="w-full sm:w-auto bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl px-4 py-2 text-sm text-adaptive focus:outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer shadow-sm shadow-black/5 h-10"
                            >
                                <option value="NEWEST" className="bg-[#121420]">Newest</option>
                                <option value="PRICE_ASC" className="bg-[#121420]">Price: Low</option>
                                <option value="PRICE_DESC" className="bg-[#121420]">Price: High</option>
                                <option value="NAME" className="bg-[#121420]">Name</option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="aspect-[4/5] bg-[var(--bg-glass)] border border-[var(--border-primary)] rounded-2xl animate-pulse"></div>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-16 text-center">
                            <span className="material-symbols-outlined text-4xl md:text-6xl text-slate-700 mb-4">error</span>
                            <p className="text-slate-400 font-medium text-sm md:text-base">{error}</p>
                            <button onClick={fetchProducts} className="mt-6 bg-primary-500 px-6 py-2.5 rounded-xl font-bold text-white hover:bg-primary-600 transition-all text-sm">Retry Connection</button>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-3xl p-12 md:p-16 text-center shadow-lg">
                            <span className="material-symbols-outlined text-4xl md:text-6xl text-[var(--text-muted)] mb-4">search_off</span>
                            <h3 className="text-[var(--text-primary)] font-bold text-lg md:text-xl mb-2">No components found</h3>
                            <p className="text-[var(--text-secondary)] text-sm md:text-base">Try adjusting your filters.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
                            {filtered.map(product => (
                                <Link
                                    key={product.id}
                                    to={`/products/${product.id}`}
                                    className="group flex flex-col bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-2xl md:rounded-3xl overflow-hidden hover:border-primary-500/50 transition-all duration-500 shadow-sm"
                                >
                                    <div className="aspect-square relative overflow-hidden bg-[#0a0b10]">
                                        {/* Badge Overlay */}
                                        {product.badge && (
                                            <div className="absolute top-2 left-2 md:top-4 md:left-4 z-10">
                                                <span className="bg-primary-500 text-white text-[7px] md:text-[9px] font-black px-2 py-1 md:px-3 md:py-1.5 rounded-full uppercase tracking-[0.1em] md:tracking-[0.15em] shadow-xl">
                                                    {product.badge}
                                                </span>
                                            </div>
                                        )}

                                        {product.imageUrls?.[0] ? (
                                            <img src={product.imageUrls[0]} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        ) : (
                                            <img src={product.categoryImageUrl || getCategoryImage(product.categoryName)} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60" />
                                        )}

                                        {!product.inStock && (
                                            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                                                <span className="bg-red-500/10 border border-red-500/30 text-red-500 text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest">Out of Stock</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-2.5 md:p-6 flex flex-col flex-1">
                                        <div className="flex justify-between items-start mb-1 md:mb-2">
                                            <div className="flex flex-col gap-0.5">
                                                <p className="text-[7px] md:text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">{product.categoryName || 'GENERAL'}</p>
                                                <h3 className="text-[11px] md:text-base font-bold text-adaptive group-hover:text-primary-500 transition-colors truncate lg:pr-4">{product.name}</h3>
                                            </div>
                                            {product.rating > 0 && (
                                                <div className="hidden md:flex items-center gap-1 bg-[var(--bg-glass)] px-2 py-1 rounded-lg border border-[var(--border-primary)]">
                                                    <span className="material-symbols-rounded text-sm text-amber-500">star</span>
                                                    <span className="text-[10px] font-bold text-[var(--text-secondary)]">{product.rating}</span>
                                                </div>
                                            )}
                                        </div>
                                        <p className="hidden md:block text-xs text-[var(--text-secondary)] mb-6 line-clamp-2 leading-relaxed font-medium">{product.description}</p>
                                        <div className="mt-auto pt-2.5 md:pt-6 border-t border-[var(--border-primary)] flex items-center justify-between">
                                            <span className="text-xs md:text-xl font-black text-adaptive">₹{(product.price ?? 0).toLocaleString()}</span>
                                            <button
                                                disabled={!product.inStock || addedIds.has(product.id)}
                                                onClick={(e) => handleAddToCart(e, product)}
                                                className={`w-7 h-7 md:w-12 md:h-12 rounded-lg md:rounded-2xl flex items-center justify-center transition-all duration-300 ${addedIds.has(product.id)
                                                    ? 'bg-green-500 text-white scale-110 shadow-lg shadow-green-500/20'
                                                    : 'bg-primary-500 text-white hover:bg-primary-600 shadow-lg shadow-primary-500/20 active:scale-95'
                                                    }`}
                                            >
                                                <span className="material-symbols-outlined text-xs md:text-xl">
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
            </div >
        </div >
    );
}
