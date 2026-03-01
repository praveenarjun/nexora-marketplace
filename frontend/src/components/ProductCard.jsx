import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';

export default function ProductCard({ product, onAddToCart }) {
    if (!product) return null;

    const isOutOfStock = !product.inStock;

    return (
        <div className="group bg-[#1c1d26] rounded-[32px] border border-white/5 overflow-hidden hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-500 flex flex-col h-full relative">
            {/* Badge Overlay */}
            {product.badge && (
                <div className="absolute top-4 left-4 z-20">
                    <span className="bg-primary-500 text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-[0.15em] shadow-xl">
                        {product.badge}
                    </span>
                </div>
            )}

            {/* Favorite Overlay */}
            <button className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-[#0a0b10]/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-primary-500 transition-colors">
                <span className="material-symbols-rounded text-xl">favorite</span>
            </button>

            {/* Image Container */}
            <Link to={`/products/${product.id}`} className="relative aspect-[4/5] w-full bg-[#0a0b10] overflow-hidden flex items-center justify-center">
                {product.imageUrls?.[0] ? (
                    <img
                        src={product.imageUrls[0]}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary-500/5">
                        <span className="material-symbols-outlined text-6xl text-primary-500/20">inventory_2</span>
                    </div>
                )}

                {isOutOfStock && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
                        <span className="text-white text-xs font-black uppercase tracking-[0.2em] px-6 py-2 border border-white/20 rounded-full">
                            Sold Out
                        </span>
                    </div>
                )}
            </Link>

            {/* Content */}
            <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-black text-slate-500 tracking-[0.2em] uppercase">
                        {product.categoryName || 'General'}
                    </p>
                    {product.rating > 0 && (
                        <div className="flex items-center gap-1">
                            <span className="material-symbols-rounded text-sm text-amber-400">star</span>
                            <span className="text-[10px] font-bold text-slate-300">{product.rating}</span>
                        </div>
                    )}
                </div>

                <Link to={`/products/${product.id}`} className="block mb-2">
                    <h3 className="text-lg font-bold text-white group-hover:text-primary-400 transition-colors line-clamp-1">
                        {product.name}
                    </h3>
                </Link>

                {/* Price and Action */}
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex flex-col">
                        <span className="text-xl font-black text-white">
                            ₹{product.price?.toLocaleString()}
                        </span>
                    </div>

                    <button
                        onClick={() => onAddToCart?.(product)}
                        disabled={isOutOfStock}
                        className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 shadow-lg ${isOutOfStock
                            ? 'bg-white/5 text-slate-600 cursor-not-allowed'
                            : 'bg-primary-500 text-white hover:bg-primary-600 shadow-primary-500/20 active:scale-95'
                            }`}
                    >
                        <span className="material-symbols-outlined text-xl">shopping_cart</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
