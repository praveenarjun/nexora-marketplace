import { useState, useEffect } from 'react';
import { ClipboardList, AlertTriangle, ArrowUpCircle, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

export default function AdminInventory() {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);

    // State for restocking
    const [restockSku, setRestockSku] = useState('');
    const [restockAmount, setRestockAmount] = useState('');
    const [isRestocking, setIsRestocking] = useState(false);

    useEffect(() => {
        // In a real app, you'd fetch all inventory from an admin endpoint.
        // For this demo, since our backend doesn't have a GET /api/inventory/all,
        // we fetch products instead and then fetch inventory for those SKUs.
        fetchInventoryState();
    }, []);

    const fetchInventoryState = async () => {
        try {
            setLoading(true);
            // 1. Get all products — response: { success, data: { content: [...] } }
            const productsRes = await api.get('/api/products');
            const productsList = productsRes.data?.data?.content || productsRes.data?.content || [];

            if (productsList.length === 0) {
                setInventory([]);
                return;
            }

            // 2. Fetch inventory for each product via GET /api/inventory/{productId}
            const inventoryResults = await Promise.allSettled(
                productsList.map(p => api.get(`/api/inventory/${p.id}`))
            );

            // 3. Merge product + inventory data
            const merged = productsList.map((p, i) => {
                const result = inventoryResults[i];
                const invData = result.status === 'fulfilled'
                    ? (result.value.data?.data || result.value.data || {})
                    : {};
                return {
                    ...p,
                    stockLevel: invData.quantity ?? invData.stockQuantity ?? 0,
                    isInStock: (invData.quantity ?? 0) > 0,
                };
            });

            setInventory(merged);
        } catch (err) {
            toast.error('Failed to load inventory levels');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleRestock = async (e) => {
        e.preventDefault();
        if (!restockSku || !restockAmount || restockAmount <= 0) return;

        // Look up productId from the already-loaded inventory list by SKU
        const product = inventory.find(p => p.sku === restockSku.toUpperCase() || p.sku?.toUpperCase() === restockSku.toUpperCase());
        if (!product) {
            toast.error(`SKU "${restockSku}" not found. Check the SKU and try again.`);
            return;
        }

        setIsRestocking(true);
        try {
            // POST /api/inventory/restock?productId={id}&quantity={n}
            await api.post(`/api/inventory/restock?productId=${product.id}&quantity=${parseInt(restockAmount, 10)}`);
            toast.success(`✅ Added ${restockAmount} units to ${product.sku}`);
            setRestockSku('');
            setRestockAmount('');
            fetchInventoryState();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to restock item');
        } finally {
            setIsRestocking(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-8">
            {/* Admin Navigation Tabs */}
            <div className="mb-8 border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <a href="/admin/orders" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                        Orders Fulfillment
                    </a>
                    <a href="/admin/products" className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                        Product Catalog
                    </a>
                    <a href="/admin/inventory" className="border-primary-500 text-primary-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
                        Inventory Levels
                    </a>
                </nav>
            </div>

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                        <ClipboardList className="w-8 h-8 mr-3 text-primary-600" />
                        Inventory Control
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Monitor stock levels and process warehouse restock shipments.
                    </p>
                </div>
            </div>

            {/* Restock Action Card */}
            <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6 mb-8 flex flex-col md:flex-row md:items-end gap-6">
                <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Process Shipment</h3>
                    <p className="text-sm text-gray-500">Scan or type SKU to add incoming stock to the warehouse.</p>
                </div>
                <form onSubmit={handleRestock} className="flex-1 flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                        <input required type="text" placeholder="SKU Code" value={restockSku} onChange={e => setRestockSku(e.target.value)} className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-primary-500 focus:border-primary-500 font-mono uppercase text-sm" />
                    </div>
                    <div className="w-32">
                        <input required type="number" min="1" placeholder="Qty" value={restockAmount} onChange={e => setRestockAmount(e.target.value)} className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-primary-500 focus:border-primary-500 text-sm" />
                    </div>
                    <button type="submit" disabled={isRestocking} className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70">
                        <ArrowUpCircle className="w-4 h-4 mr-2" /> Add Stock
                    </button>
                </form>
            </div>

            {/* Inventory Table */}
            <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product / SKU</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Available Quantity</th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan="4" className="text-center py-10 text-gray-500"><div className="animate-pulse">Scanning warehouse bins...</div></td></tr>
                        ) : inventory.length === 0 ? (
                            <tr><td colSpan="4" className="text-center py-10 text-gray-500 font-medium">No products trackable. Create a product first!</td></tr>
                        ) : (
                            inventory.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                        <div className="text-xs text-gray-500 font-mono mt-0.5">{item.sku}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {item.stockLevel > 10 ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                <CheckCircle className="w-3 h-3 mr-1" /> In Stock
                                            </span>
                                        ) : item.stockLevel > 0 ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                <AlertTriangle className="w-3 h-3 mr-1" /> Low Stock
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                <AlertTriangle className="w-3 h-3 mr-1" /> Depleted
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">
                                        {item.stockLevel} units
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => { setRestockSku(item.sku); setRestockAmount('50'); }}
                                            className="text-primary-600 hover:text-primary-900 bg-primary-50 px-3 py-1 rounded-md"
                                        >
                                            Quick Restock +50
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
