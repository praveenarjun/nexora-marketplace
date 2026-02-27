import { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle2, Clock, Loader } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            // Fetch user's orders (assuming backend returns them properly)
            // Note: If backend doesn't filter by user yet, this will fetch ALL orders,
            // but in a real system this would be `/api/orders/user` or handled contextually by JWT.
            const response = await api.get('/api/orders');

            // We reverse the array so the newest orders appear at the top
            const content = Array.isArray(response.data) ? response.data : response.data?.content || [];
            setOrders([...content].reverse());
        } catch (err) {
            toast.error('Failed to load order history');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[50vh] flex justify-center items-center text-gray-500">
                <Loader className="w-10 h-10 animate-spin mr-3 text-primary-500" />
                <span className="text-lg font-medium">Retrieving your order history...</span>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-8 text-gray-900">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold tracking-tight">Order History</h1>
                <p className="mt-2 text-gray-500">Check the status of recent orders, manage returns, and download invoices.</p>
            </div>

            {orders.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 flex flex-col items-center justify-center text-center">
                    <Package className="w-16 h-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No orders placed yet</h3>
                    <p className="mt-1 text-gray-500 mb-6">When you buy items, they will appear here tracking their journey to you.</p>
                    <Link to="/products" className="px-6 py-3 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors">
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="space-y-8">
                    {orders.map((order) => {
                        // Calculate total simply by summing all items
                        const total = order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
                        // Determine status based on whatever the backend provides (assumed COMPLETED if it exists)
                        const status = order.status || 'COMPLETED';

                        return (
                            <div key={order.id} className="bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow">

                                {/* Order Header */}
                                <div className="bg-gray-50 border-b border-gray-200 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 flex-1">
                                        <div>
                                            <p className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Order Number</p>
                                            <p className="mt-1 text-sm font-medium text-gray-900 font-mono">#{order.orderNumber}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Date Placed</p>
                                            <p className="mt-1 text-sm font-medium text-gray-900">
                                                {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : 'Just now'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Total Amount</p>
                                            <p className="mt-1 text-sm font-medium text-gray-900">${total.toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold uppercase text-gray-500 tracking-wider mb-1">Status</p>
                                            {status === 'COMPLETED' ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    <CheckCircle2 className="w-3 h-3 mr-1" /> Delivered
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    <Clock className="w-3 h-3 mr-1" /> Processing
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="sm:ml-6 flex items-center justify-start sm:justify-end">
                                        <button className="text-sm font-medium text-primary-600 hover:text-primary-700 bg-primary-50 px-4 py-2 rounded-lg hover:bg-primary-100 transition-colors">
                                            View Invoice
                                        </button>
                                    </div>
                                </div>

                                {/* Order Items List */}
                                <div className="p-6">
                                    <h4 className="sr-only">Items</h4>
                                    <ul role="list" className="divide-y divide-gray-100">
                                        {order.items?.map((item, idx) => (
                                            <li key={idx} className="py-4 flex items-center">
                                                <div className="h-16 w-16 flex-shrink-0 bg-gray-100 rounded-lg flex items-center justify-center font-bold text-gray-400 border border-gray-200">
                                                    {item.skuCode?.substring(0, 2).toUpperCase() || 'IT'}
                                                </div>
                                                <div className="ml-4 flex-1">
                                                    <p className="text-sm font-medium text-gray-900">{item.productName || item.skuCode}</p>
                                                    <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity}</p>
                                                </div>
                                                <div className="ml-4 text-sm font-medium text-gray-900">
                                                    ${item.price?.toFixed(2)}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* Shipping Info */}
                                    {order.shippingAddress && (
                                        <div className="mt-6 pt-6 border-t border-gray-100">
                                            <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                                                <Truck className="w-4 h-4 mr-2 text-gray-400" />
                                                Delivery Address
                                            </h4>
                                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg inline-block border border-gray-100">
                                                {order.shippingAddress}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
