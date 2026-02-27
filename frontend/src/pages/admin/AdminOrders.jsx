import { useState, useEffect } from 'react';
import { Truck, CheckCircle, Clock, PackageOpen, LayoutList } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            // Fetch all orders system-wide
            const response = await api.get('/api/orders');

            const content = Array.isArray(response.data) ? response.data : response.data?.content || [];
            // Sort newest first
            setOrders([...content].reverse());
        } catch (err) {
            toast.error('Failed to load global orders');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-8 text-gray-900">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold flex items-center">
                        <LayoutList className="w-8 h-8 mr-3 text-primary-600" />
                        Global Order Fulfillment
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        View all incoming customer orders processed by the RabbitMQ event bus.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-3 space-y-6">
                    {loading ? (
                        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500 animate-pulse">
                            Fetching cross-service order data...
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center flex flex-col items-center">
                            <PackageOpen className="w-16 h-16 text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium">No system orders processed yet.</h3>
                        </div>
                    ) : (
                        orders.map((order) => {
                            const total = order.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;

                            return (
                                <div key={order.id} className="bg-white shadow-sm border border-gray-200 overflow-hidden sm:rounded-xl">
                                    {/* Fulfillment Header */}
                                    <div className="bg-gray-50 border-b border-gray-200 px-6 py-5 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg leading-6 font-bold text-gray-900">
                                                Order #{order.orderNumber}
                                            </h3>
                                            <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                                Placed: {order.orderDate ? new Date(order.orderDate).toLocaleString() : 'Recently'}
                                            </p>
                                        </div>
                                        <div>
                                            {order.status === 'COMPLETED' || order.status === 'SHIPPED' ? (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                                    <CheckCircle className="w-4 h-4 mr-2" /> {order.status}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                                                    <Clock className="w-4 h-4 mr-2" /> {order.status || 'Pending'}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Split Content Body */}
                                    <div className="px-6 py-5 sm:p-0 grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-200">

                                        {/* Left: Shipping Data */}
                                        <div className="p-6">
                                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Fulfillment Details</h4>
                                            <dl className="space-y-4 text-sm">
                                                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                                                    <dt className="font-medium text-gray-900 mb-1">Shipping Destination:</dt>
                                                    <dd className="text-gray-600 font-mono whitespace-pre-wrap">{order.shippingAddress || 'N/A'}</dd>
                                                </div>
                                                <div className="flex justify-between items-center px-1">
                                                    <dt className="font-medium text-gray-900">Billed Total:</dt>
                                                    <dd className="text-lg font-bold text-primary-600">${total.toFixed(2)}</dd>
                                                </div>
                                            </dl>
                                        </div>

                                        {/* Right: Line Items */}
                                        <div className="p-6">
                                            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Pack List</h4>
                                            <ul className="space-y-3">
                                                {order.items?.map((item, idx) => (
                                                    <li key={idx} className="flex justify-between items-start text-sm bg-gray-50 rounded-lg p-2 border border-gray-100">
                                                        <div>
                                                            <span className="font-medium text-gray-900 block">{item.productName || item.skuCode}</span>
                                                            <span className="text-xs text-gray-500 font-mono">SKU: {item.skuCode}</span>
                                                        </div>
                                                        <div className="text-right ml-4">
                                                            <span className="font-bold text-gray-900">x{item.quantity}</span>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Action Bar */}
                                    <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 text-right sm:px-6">
                                        <button className="bg-white border border-gray-300 rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 mr-3">
                                            Print Packing Slip
                                        </button>
                                        <button className="bg-primary-600 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                                            Mark as Shipped
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
