import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { CheckCircle, Truck, ShieldCheck, CreditCard } from 'lucide-react';
import useCart from '../hooks/useCart';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

export default function Checkout() {
    const cart = useCart();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [isProcessing, setIsProcessing] = useState(false);
    const [shippingAddress, setShippingAddress] = useState(user?.address || '');

    // If cart is empty, user shouldn't be here
    if (cart.items.length === 0) {
        return (
            <div className="min-h-[50vh] flex flex-col justify-center items-center">
                <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
                <Link to="/products" className="text-primary-600 hover:underline">Return to Shop</Link>
            </div>
        );
    }

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        if (!shippingAddress.trim()) {
            toast.error('Shipping address is required');
            return;
        }

        setIsProcessing(true);

        try {
            // Structure payload exactly as Order Service expects
            const orderPayload = {
                shippingAddress,
                items: cart.items.map(item => ({
                    productId: item.productId,
                    skuCode: item.skuCode,
                    price: item.price,
                    quantity: item.quantity
                }))
            };

            // 1. Send Order to Gateway -> Order Service -> RabbitMQ
            await api.post('/api/orders', orderPayload);

            // 2. Success! Clear the cart
            cart.clearCart();

            // 3. Notify and Redirect
            toast.success('Order placed successfully! Check your email for confirmation.', { duration: 5000 });
            navigate('/orders');

        } catch (err) {
            console.error('Order failed:', err);
            if (err.response?.status === 503) {
                toast.error('The Order Service is currently waking up. Please try again in 60 seconds.');
            } else {
                toast.error(err.response?.data?.message || 'Failed to place order. Please try again.');
            }
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-8">Secure Checkout</h1>

            <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
                {/* Checkout Form */}
                <div className="lg:col-span-7">
                    <form onSubmit={handlePlaceOrder}>
                        <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 sm:p-8 space-y-8">

                            {/* Customer Info Review */}
                            <div>
                                <h2 className="text-lg font-medium text-gray-900 flex items-center mb-4 border-b border-gray-100 pb-2">
                                    <CheckCircle className="w-5 h-5 text-primary-500 mr-2" /> Contact Information
                                </h2>
                                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                    <div>
                                        <span className="block font-medium text-gray-900">Name</span>
                                        {user?.firstName} {user?.lastName}
                                    </div>
                                    <div>
                                        <span className="block font-medium text-gray-900">Email</span>
                                        {user?.email}
                                    </div>
                                </div>
                            </div>

                            {/* Shipping Address */}
                            <div>
                                <h2 className="text-lg font-medium text-gray-900 flex items-center mb-4 border-b border-gray-100 pb-2">
                                    <Truck className="w-5 h-5 text-primary-500 mr-2" /> Delivery
                                </h2>
                                <div>
                                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                                        Shipping Address (Required)
                                    </label>
                                    <textarea
                                        id="address"
                                        required
                                        rows={3}
                                        value={shippingAddress}
                                        onChange={(e) => setShippingAddress(e.target.value)}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                        placeholder="123 Cloud Native Way, Tech City, Serverless State 90210"
                                    />
                                </div>
                            </div>

                            {/* Payment Section (Mock) */}
                            <div>
                                <h2 className="text-lg font-medium text-gray-900 flex items-center mb-4 border-b border-gray-100 pb-2">
                                    <CreditCard className="w-5 h-5 text-primary-500 mr-2" /> Payment
                                </h2>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start">
                                    <ShieldCheck className="w-5 h-5 text-blue-500 mr-3 mt-0.5" />
                                    <p className="text-sm text-blue-700">
                                        This is a demonstration environment. No real payment is required. Placing this order will instantly trigger a RabbitMQ event to allocate inventory and dispatch an email.
                                    </p>
                                </div>
                            </div>

                        </div>

                        <div className="mt-8 border-t border-gray-200 pt-8 flex justify-end">
                            <button
                                type="submit"
                                disabled={isProcessing}
                                className={`w-full sm:w-auto flex justify-center py-4 px-10 border border-transparent rounded-xl shadow-md text-base font-bold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors ${isProcessing ? 'opacity-70 cursor-wait' : ''}`}
                            >
                                {isProcessing ? 'Processing Transaction...' : 'Confirm order & Pay'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Order Summary Sidebar */}
                <section className="mt-16 lg:mt-0 lg:col-span-5 relative">
                    <div className="bg-gray-50 border border-gray-200 shadow-sm rounded-2xl p-6 sm:p-8 sticky top-24">
                        <h2 className="text-lg font-medium text-gray-900 mb-6 border-b border-gray-200 pb-4">Order Summary</h2>

                        <ul role="list" className="divide-y divide-gray-200 max-h-[40vh] overflow-y-auto pr-2">
                            {cart.items.map((item) => (
                                <li key={item.productId} className="py-4 flex text-sm">
                                    <div className="flex-shrink-0 w-16 h-16 bg-white border border-gray-200 rounded-md flex items-center justify-center font-bold text-gray-300">
                                        {item.name.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="ml-4 flex-1 flex flex-col">
                                        <div>
                                            <div className="flex justify-between font-medium text-gray-900">
                                                <h3 className="line-clamp-2 pr-2">{item.name}</h3>
                                                <p>${((item.price ?? 0) * item.quantity).toFixed(2)}</p>
                                            </div>
                                            <p className="mt-1 text-gray-500 font-mono text-xs">{item.skuCode}</p>
                                        </div>
                                        <div className="flex-1 flex items-end justify-between">
                                            <p className="text-gray-500">Qty {item.quantity}</p>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        <dl className="mt-6 border-t border-gray-200 pt-6 space-y-4 text-sm text-gray-600">
                            <div className="flex justify-between">
                                <dt>Subtotal</dt>
                                <dd className="text-gray-900 font-medium">${cart.getTotalPrice().toFixed(2)}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt>Shipping</dt>
                                <dd className="text-gray-900 font-medium">$0.00</dd>
                            </div>
                            <div className="flex justify-between border-t border-gray-200 pt-4">
                                <dt className="text-base font-bold text-gray-900">Total</dt>
                                <dd className="text-xl font-black text-gray-900">${cart.getTotalPrice().toFixed(2)}</dd>
                            </div>
                        </dl>
                    </div>
                </section>
            </div>
        </div>
    );
}
