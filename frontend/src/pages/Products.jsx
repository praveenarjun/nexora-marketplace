import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, AlertCircle, Loader } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import useCart from '../hooks/useCart';

export default function Products() {
    const cart = useCart();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filtering & Sorting State
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [sortBy, setSortBy] = useState('NEWEST');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get('/api/products');

            // Depending on backend pagination structure, it might be response.data or response.data.content
            const content = Array.isArray(response.data) ? response.data : response.data?.content || [];
            setProducts(content);
        } catch (err) {
            console.error('Failed to fetch products:', err);
            // Give a helpful error if the 503 Circuit Breaker trips during Cold Start
            if (err.response?.status === 503) {
                setError('The Catalog Service is waking up. Please refresh the page in about 60 seconds.');
            } else {
                setError('Failed to load the product catalog. Please try again later.');
            }
            toast.error('Could not load products');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = (product) => {
        cart.addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            skuCode: product.skuCode || product.sku,
            quantity: 1,
            stockQuantity: product.stockQuantity
        });
    };

    // Derive categories dynamically from available products
    const categories = ['ALL', ...new Set(products.map(p => typeof p.category === 'string' ? p.category : p.categoryId).filter(Boolean).map(String))];

    // Apply filters and sorting
    const filteredProducts = products
        .filter(product => {
            // Search term
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description?.toLowerCase().includes(searchTerm.toLowerCase());

            // Category filter
            const matchesCategory = selectedCategory === 'ALL' ||
                String(product.categoryId) === selectedCategory ||
                String(product.category) === selectedCategory;

            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
            if (sortBy === 'PRICE_LOW') return Number(a.price) - Number(b.price);
            if (sortBy === 'PRICE_HIGH') return Number(b.price) - Number(a.price);
            // Sort by newest if products have a date field, otherwise preserve order
            if (sortBy === 'NEWEST' && a.createdAt && b.createdAt) {
                return new Date(b.createdAt) - new Date(a.createdAt);
            }
            return 0; // Default to natural/NEWEST
        });

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header & Controls */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 pb-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Product Catalog</h1>
                    <p className="mt-2 text-gray-500">Discover our collection of premium technology.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search Box */}
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm"
                        />
                    </div>

                    {/* Category Filter */}
                    <div className="relative flex items-center">
                        <SlidersHorizontal className="absolute left-3 h-4 w-4 text-gray-400 pointer-events-none" />
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="pl-9 pr-8 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white text-sm w-full sm:w-auto"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>
                                    {cat === 'ALL' ? 'All Categories' : `Category ${cat}`}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Sort Menu */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white text-sm"
                    >
                        <option value="NEWEST">Sorting: Newest</option>
                        <option value="PRICE_LOW">Price: Low to High</option>
                        <option value="PRICE_HIGH">Price: High to Low</option>
                    </select>
                </div>
            </div>

            {/* Main Content Area */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 text-gray-500">
                    <Loader className="w-12 h-12 text-primary-500 animate-spin mb-4" />
                    <p className="text-lg font-medium">Fetching catalog from Microservices...</p>
                    <p className="text-sm mt-2 opacity-75">(This may take up to 60 seconds if Render is cold-starting)</p>
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-32 text-rose-500">
                    <AlertCircle className="w-16 h-16 text-rose-400 mb-4" />
                    <h3 className="text-xl font-bold bg-white">{error}</h3>
                    <button
                        onClick={fetchProducts}
                        className="mt-6 px-6 py-2 bg-rose-50 text-rose-700 rounded-lg font-medium hover:bg-rose-100 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
                    <Search className="w-12 h-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No products found</h3>
                    <p className="text-gray-500 mt-1">Try adjusting your search or filter criteria.</p>
                    {searchTerm || selectedCategory !== 'ALL' ? (
                        <button
                            onClick={() => { setSearchTerm(''); setSelectedCategory('ALL'); }}
                            className="mt-4 text-primary-600 font-medium hover:text-primary-700"
                        >
                            Clear all filters
                        </button>
                    ) : null}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredProducts.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onAddToCart={handleAddToCart}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
