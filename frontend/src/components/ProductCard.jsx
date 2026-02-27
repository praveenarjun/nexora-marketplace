import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';

export default function ProductCard({ product, onAddToCart }) {
    // Gracefully handle missing product data
    if (!product) return null;

    const isOutOfStock = !product.stockQuantity || product.stockQuantity <= 0;

    return (
        <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full">
            {/* Image Container - Fixed height with placeholder */}
            <div className="relative h-64 w-full bg-gray-100 overflow-hidden flex items-center justify-center p-6">
                {/* We use a placeholder since the backend doesn't currently serve image URLs natively */}
                <div className="w-full h-full bg-gradient-to-tr from-gray-200 to-gray-100 rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-transform duration-500">
                    {(product.name || 'NA').substring(0, 2).toUpperCase()}
                </div>

                {/* Out of Stock Badge */}
                {isOutOfStock && (
                    <div className="absolute top-4 right-4 bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md z-10 animate-pulse">
                        OUT OF STOCK
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                    <p className="text-xs font-semibold text-primary-600 tracking-wider uppercase">
                        SKU: {product.skuCode}
                    </p>
                </div>

                <Link to={`/products/${product.id}`} className="block">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-primary-600 transition-colors line-clamp-2">
                        {product.name}
                    </h3>
                </Link>

                <p className="text-sm text-gray-500 mb-6 flex-grow line-clamp-3">
                    {product.description}
                </p>

                {/* Footer actions */}
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-2xl font-black text-gray-900">
                        ${product.price?.toFixed(2)}
                    </span>

                    <button
                        onClick={() => onAddToCart(product)}
                        disabled={isOutOfStock}
                        className={`flex items-center justify-center p-3 rounded-xl transition-all duration-200 ${isOutOfStock
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-primary-50 text-primary-700 hover:bg-primary-600 hover:text-white shadow-sm hover:shadow-md'
                            }`}
                        aria-label="Add to cart"
                    >
                        <ShoppingCart className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
