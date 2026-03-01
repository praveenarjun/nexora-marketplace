import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import useCart from '../hooks/useCart';

export default function ProductDetail() {
    const { id } = useParams();
    const cart = useCart();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [productRes, allProductsRes] = await Promise.all([
                    api.get(`/api/products/${id}`),
                    api.get('/api/products')
                ]);

                const prodData = productRes.data?.data || productRes.data;
                setProduct(prodData);

                const all = allProductsRes.data?.data?.content || allProductsRes.data || [];
                setRelatedProducts(all.filter(p => p.id !== parseInt(id)).slice(0, 4));
            } catch (err) {
                toast.error('Failed to load product details');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        window.scrollTo(0, 0);
    }, [id]);

    const handleAddToCart = () => {
        if (!product) return;
        setAdding(true);
        cart.addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            sku: product.sku,
            quantity: quantity,
        });
        toast.success(`Added ${quantity} ${product.name} to cart`);
        setTimeout(() => setAdding(false), 1000);
    };

    if (loading) return (
        <div className="max-w-7xl mx-auto px-6 py-20">
            <div className="animate-pulse flex flex-col md:flex-row gap-12">
                <div className="w-full md:w-1/2 aspect-square bg-white/5 rounded-3xl"></div>
                <div className="flex-1 space-y-6 pt-10">
                    <div className="h-10 bg-white/5 rounded w-3/4"></div>
                    <div className="h-6 bg-white/5 rounded w-1/4"></div>
                    <div className="h-32 bg-white/5 rounded"></div>
                    <div className="h-12 bg-white/5 rounded w-full"></div>
                </div>
            </div>
        </div>
    );

    if (!product) return (
        <div className="max-w-7xl mx-auto px-6 py-20 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Product not found</h2>
            <Link to="/products" className="bg-primary-500 px-8 py-3 rounded-xl font-bold text-white">Back to Catalog</Link>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto w-full px-6 py-12">
            <div className="flex flex-col md:flex-row gap-10">
                {/* Reusable Sidebar (Simplified for Detail View) */}
                <aside className="hidden lg:block w-64 flex-shrink-0 space-y-8">
                    <div>
                        <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary-500">category</span>
                            Browse
                        </h3>
                        <div className="space-y-1">
                            <Link to="/products" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-all">
                                <span className="material-symbols-outlined text-sm">arrow_back</span>
                                <span className="text-sm font-bold">Back to Catalog</span>
                            </Link>
                            <Link to="/products?category=electronics" className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-primary-500/10 text-primary-500 font-bold">
                                <span className="text-sm">Active Category</span>
                            </Link>
                        </div>
                    </div>
                </aside>

                {/* Main Content Area */}
                <section className="flex-1">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider mb-8">
                        <Link to="/home" className="hover:text-primary-500 transition-colors">Home</Link>
                        <span className="material-symbols-outlined text-[10px]">chevron_right</span>
                        <Link to="/products" className="hover:text-primary-500 transition-colors">Catalog</Link>
                        <span className="material-symbols-outlined text-[10px]">chevron_right</span>
                        <span className="text-primary-500">{product.categoryName || 'Electronics'}</span>
                    </nav>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        {/* Left: Image Showcase */}
                        <div className="lg:col-span-7 space-y-4">
                            <div className="aspect-[4/3] bg-white/5 border border-white/10 rounded-3xl overflow-hidden relative group">
                                {product.imageUrls?.[0] ? (
                                    <img src={product.imageUrls[0]} alt={product.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <span className="material-symbols-outlined text-9xl text-slate-800">developer_board</span>
                                    </div>
                                )}
                                {product.featured && (
                                    <div className="absolute top-6 right-6">
                                        <span className="bg-primary-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-xl">Bestseller</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right: Info Area */}
                        <div className="lg:col-span-5 flex flex-col gap-6">
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${product.inStock
                                            ? 'bg-green-500/20 text-green-500 border border-green-500/30'
                                            : 'bg-red-500/20 text-red-500 border border-red-500/30'
                                        }`}>
                                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                                    </span>
                                    <span className="text-slate-500 text-xs font-bold font-mono">SKU: {product.sku}</span>
                                </div>
                                <h1 className="text-4xl font-black text-white tracking-tight leading-[1.1] mb-2">{product.name}</h1>
                            </div>

                            <div className="flex items-baseline gap-4">
                                <span className="text-4xl font-black text-primary-500">₹{product.price?.toLocaleString()}</span>
                                <span className="text-slate-500 line-through text-lg font-medium">₹{(product.price * 1.2).toLocaleString()}</span>
                            </div>

                            <div className="border-y border-white/5 py-8">
                                <p className="text-slate-400 leading-relaxed font-light mb-6">
                                    {product.description || 'Enterprise-grade microservice component optimized for high-throughput distributed systems. Featuring seamless gRPC integration and real-time monitoring support.'}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {['Cloud-Native', 'Scalable', 'Optimized'].map(tag => (
                                        <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 text-slate-500 text-[10px] font-bold uppercase rounded-full tracking-wider hover:border-primary-500/50 hover:text-primary-500 transition-all cursor-default">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center gap-6">
                                    <div className="flex flex-col gap-1.5">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Quantity</span>
                                        <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1 h-12">
                                            <button
                                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                                className="w-10 h-full flex items-center justify-center hover:bg-white/5 rounded-lg text-slate-400 transition-all"
                                            >
                                                <span className="material-symbols-outlined text-sm">remove</span>
                                            </button>
                                            <input
                                                type="number"
                                                value={quantity}
                                                readOnly
                                                className="w-10 text-center bg-transparent border-none text-white font-bold text-sm focus:ring-0"
                                            />
                                            <button
                                                onClick={() => setQuantity(q => q + 1)}
                                                className="w-10 h-full flex items-center justify-center hover:bg-white/5 rounded-lg text-slate-400 transition-all"
                                            >
                                                <span className="material-symbols-outlined text-sm">add</span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex-1 pt-5">
                                        <button
                                            onClick={handleAddToCart}
                                            disabled={!product.inStock || adding}
                                            className={`w-full h-12 flex items-center justify-center gap-3 rounded-xl font-bold transition-all shadow-lg ${adding
                                                    ? 'bg-green-500 text-white scale-95'
                                                    : 'bg-primary-500 text-white hover:bg-primary-600 shadow-primary-500/20 active:scale-95'
                                                } ${!product.inStock ? 'opacity-30 cursor-not-allowed grayscale' : ''}`}
                                        >
                                            <span className="material-symbols-outlined text-sm">{adding ? 'check' : 'shopping_cart'}</span>
                                            {adding ? 'Added' : 'Add to Collection'}
                                        </button>
                                    </div>
                                </div>

                                <button className="w-full h-12 flex items-center justify-center gap-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all">
                                    <span className="material-symbols-outlined text-sm">favorite</span>
                                    Add to Wishlist
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl">
                                    <span className="material-symbols-outlined text-primary-500">local_shipping</span>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-white uppercase tracking-wider">Free Delivery</span>
                                        <span className="text-[10px] text-slate-500 font-bold uppercase">2-3 Business Days</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl">
                                    <span className="material-symbols-outlined text-primary-500">verified_user</span>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-white uppercase tracking-wider">3yr Warranty</span>
                                        <span className="text-[10px] text-slate-500 font-bold uppercase">Enterprise Support</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Related Solutions */}
                    <section className="mt-24">
                        <div className="flex items-center justify-between mb-10">
                            <h3 className="text-3xl font-black text-white tracking-tight">Related Solutions</h3>
                            <Link to="/products" className="text-primary-500 font-bold flex items-center gap-1 hover:underline text-sm uppercase tracking-widest">
                                View Marketplace
                                <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {relatedProducts.map(p => (
                                <Link key={p.id} to={`/products/${p.id}`} className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-primary-500/50 transition-all flex flex-col">
                                    <div className="aspect-square bg-slate-800 relative overflow-hidden">
                                        {p.imageUrls?.[0] ? (
                                            <img src={p.imageUrls[0]} alt={p.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <span className="material-symbols-outlined text-4xl text-slate-700">inventory_2</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h4 className="font-bold text-white text-sm truncate mb-1">{p.name}</h4>
                                        <span className="text-primary-500 font-black text-sm">₹{p.price?.toLocaleString()}</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                </section>
            </div>
        </div>
    );
}
