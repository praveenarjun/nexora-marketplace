import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, ShoppingCart, Star, Package, Filter } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import useCart from '../hooks/useCart';

const PRODUCT_EMOJIS = { 2: '📱', 3: '💻', 4: '🎧', 5: '⌚', 6: '📷', default: '📦' };
const getEmoji = (categoryId) => PRODUCT_EMOJIS[categoryId] || PRODUCT_EMOJIS.default;

const getPlaceholderImg = (name = '') => {
    const keywords = name.toLowerCase().includes('phone') ? 'smartphone' :
        name.toLowerCase().includes('laptop') ? 'laptop' :
            name.toLowerCase().includes('headphone') || name.toLowerCase().includes('ear') ? 'headphones' :
                name.toLowerCase().includes('tablet') ? 'tablet' : 'electronics';
    return `https://source.unsplash.com/400x400/?${keywords}&sig=${Math.abs(name.charCodeAt(0) + name.charCodeAt(1))}`;
};

export default function Products() {
    const cart = useCart();
    const [searchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [sortBy, setSortBy] = useState('NEWEST');
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
        .sort((a, b) => {
            if (sortBy === 'PRICE_ASC') return a.price - b.price;
            if (sortBy === 'PRICE_DESC') return b.price - a.price;
            if (sortBy === 'NAME') return a.name?.localeCompare(b.name);
            return b.id - a.id;
        });

    return (
        <div className="min-h-screen py-8 px-4 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-white mb-1">Electronics Catalog</h1>
                <p className="text-slate-500 text-sm">Premium hardware optimized for distributed systems.</p>
            </div>

            {/* Search + Filters bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="input-dark pl-10 w-full"
                    />
                </div>
                <select
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    className="input-dark w-full sm:w-48 cursor-pointer"
                >
                    {categories.map(c => <option key={c} value={c} className="bg-slate-900">{c === 'ALL' ? 'All Categories' : c}</option>)}
                </select>
                <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="input-dark w-full sm:w-44 cursor-pointer"
                >
                    <option value="NEWEST" className="bg-slate-900">Newest First</option>
                    <option value="PRICE_ASC" className="bg-slate-900">Price: Low to High</option>
                    <option value="PRICE_DESC" className="bg-slate-900">Price: High to Low</option>
                    <option value="NAME" className="bg-slate-900">Name A–Z</option>
                </select>
            </div>

            <div className="flex items-center gap-2 mb-6">
                <Filter className="w-4 h-4 text-slate-500" />
                <span className="text-slate-500 text-sm">Showing <span className="text-white font-medium">{filtered.length}</span> of {products.length} products</span>
            </div>

            {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="glass-card animate-pulse">
                            <div className="aspect-square bg-white/5 rounded-t-2xl"></div>
                            <div className="p-4 space-y-2">
                                <div className="h-3 bg-white/5 rounded w-3/4"></div>
                                <div className="h-3 bg-white/5 rounded w-1/2"></div>
                                <div className="h-8 bg-white/5 rounded mt-3"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="glass-card p-12 text-center">
                    <Package className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">{error}</p>
                    <button onClick={fetchProducts} className="btn-primary mt-4 px-6 py-2 text-sm">Retry</button>
                </div>
            ) : filtered.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <Search className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-white font-semibold mb-2">No products found</h3>
                    <p className="text-slate-500 text-sm">Try adjusting your search or filter criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filtered.map(product => (
                        <Link key={product.id} to={`/products/${product.id}`} className="glass-card-hover overflow-hidden group block">
                            {/* Image */}
                            <div className="aspect-square bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center relative rounded-t-2xl overflow-hidden">
                                {product.imageUrls?.[0] ? (
                                    <img
                                        src={product.imageUrls[0]}
                                        alt={product.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        onError={e => { e.target.style.display = 'none'; }}
                                    />
                                ) : (
                                    <span className="text-5xl">{getEmoji(product.categoryId)}</span>
                                )}
                                {product.featured && (
                                    <div className="absolute top-2 left-2 badge-blue text-xs flex items-center gap-1">
                                        <Star className="w-3 h-3" /> Featured
                                    </div>
                                )}
                                {!product.inStock && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-t-2xl">
                                        <span className="badge-red text-xs">Out of Stock</span>
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="p-4">
                                <div className="text-xs text-slate-500 mb-1">{product.categoryName || 'Electronics'}</div>
                                <h3 className="font-semibold text-white text-sm leading-tight truncate mb-1">{product.name}</h3>
                                <div className="text-xs text-slate-600 mb-3 font-mono">{product.sku}</div>
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-primary-400 text-base">₹{product.price?.toLocaleString()}</span>
                                    <button
                                        onClick={(e) => handleAddToCart(e, product)}
                                        disabled={!product.inStock || addedIds.has(product.id)}
                                        className={`btn-primary py-1.5 px-3 text-xs rounded-lg ${!product.inStock ? 'opacity-40 cursor-not-allowed' : ''} ${addedIds.has(product.id) ? 'bg-green-600' : ''}`}
                                    >
                                        <ShoppingCart className="w-3.5 h-3.5" />
                                        {addedIds.has(product.id) ? 'Added!' : 'Add'}
                                    </button>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
