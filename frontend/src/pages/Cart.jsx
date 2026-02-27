import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import useCart from '../hooks/useCart';

export default function Cart() {
    const cart = useCart();
    const navigate = useNavigate();

    if (cart.items.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 text-center max-w-lg w-full">
                    <div className="mx-auto w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mb-6">
                        <ShoppingBag className="w-10 h-10 text-primary-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                    <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
                    <Link
                        to="/products"
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                    >
                        Start Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-8">Shopping Cart</h1>

            <div className="mt-8 lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
                {/* Cart Items List */}
                <div className="lg:col-span-7">
                    <ul role="list" className="border-t border-b border-gray-200 divide-y divide-gray-200">
                        {cart.items.map((item) => (
                            <li key={item.productId} className="flex py-6 sm:py-8">
                                {/* Item Placeholder Image */}
                                <div className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200">
                                    <span className="text-2xl text-gray-400 font-bold opacity-40">
                                        {item.name.substring(0, 2).toUpperCase()}
                                    </span>
                                </div>

                                <div className="ml-4 flex-1 flex flex-col justify-between sm:ml-6">
                                    <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                                        <div>
                                            <div className="flex justify-between">
                                                <h3 className="text-lg font-medium text-gray-900 hover:text-primary-600">
                                                    <Link to={`/products/${item.productId}`}>{item.name}</Link>
                                                </h3>
                                            </div>
                                            <div className="mt-1 flex text-sm">
                                                <p className="text-gray-500">SKU: {item.skuCode}</p>
                                            </div>
                                            <p className="mt-2 text-lg font-bold text-gray-900">${(item.price ?? 0).toFixed(2)}</p>
                                        </div>

                                        <div className="mt-4 sm:mt-0 sm:pr-9">
                                            <div className="flex items-center border border-gray-300 rounded-lg w-min">
                                                <button
                                                    onClick={() => cart.updateQuantity(item.productId, item.quantity - 1)}
                                                    className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-l-lg transition-colors"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="px-4 py-2 text-gray-900 font-medium border-x border-gray-300">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => cart.updateQuantity(item.productId, item.quantity + 1)}
                                                    className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-r-lg transition-colors"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                            {item.stockQuantity !== undefined && (
                                                <p className="mt-2 text-xs text-gray-400">
                                                    {item.quantity >= item.stockQuantity ? 'Max available reached' : `${item.stockQuantity} available`}
                                                </p>
                                            )}

                                            <div className="absolute top-0 right-0">
                                                <button
                                                    type="button"
                                                    onClick={() => cart.removeItem(item.productId)}
                                                    className="-m-2 p-2 inline-flex text-gray-400 hover:text-red-500 transition-colors"
                                                >
                                                    <span className="sr-only">Remove</span>
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Order Summary */}
                <section className="mt-16 bg-gray-50 rounded-2xl px-4 py-6 sm:p-6 lg:p-8 lg:mt-0 lg:col-span-5 border border-gray-200 shadow-sm sticky top-24">
                    <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>

                    <dl className="mt-6 space-y-4 text-sm text-gray-600">
                        <div className="flex items-center justify-between">
                            <dt>Subtotal ({cart.getTotalItems()} items)</dt>
                            <dd className="text-gray-900 font-medium">${cart.getTotalPrice().toFixed(2)}</dd>
                        </div>
                        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                            <dt className="flex items-center text-gray-600">
                                <span>Shipping estimate</span>
                            </dt>
                            <dd className="text-gray-900 font-medium">Free</dd>
                        </div>
                        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                            <dt className="flex items-center text-gray-600">
                                <span>Tax estimate</span>
                            </dt>
                            <dd className="text-gray-900 font-medium">$0.00</dd>
                        </div>
                        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                            <dt className="text-base font-bold text-gray-900">Order total</dt>
                            <dd className="text-2xl font-black text-gray-900">${cart.getTotalPrice().toFixed(2)}</dd>
                        </div>
                    </dl>

                    <div className="mt-8">
                        <button
                            onClick={() => navigate('/checkout')}
                            className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-md text-base font-bold text-white bg-primary-600 hover:bg-primary-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
                        >
                            Proceed to Checkout
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </button>
                    </div>

                    <div className="mt-4 text-center">
                        <Link to="/products" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                            or Continue Shopping
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
}
