import { useState, useEffect } from 'react';
import { PackageSearch, Plus, Pencil, Trash2, Tag, Loader } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

export default function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Quick form state for creation
    const [isCreating, setIsCreating] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        skuCode: '',
        categoryId: 1, // Defaulting to 1 to match backend mapping requirements
        stockQuantity: '' // Used to automatically populate Inventory Service!
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await api.get('/api/products');
            setProducts(Array.isArray(response.data) ? response.data : response.data?.content || []);
        } catch (err) {
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            // 1. Create the Product via product-service
            const productPayload = {
                name: formData.name,
                description: formData.description,
                price: window.parseFloat(formData.price),
                skuCode: formData.skuCode,
                categoryId: window.parseInt(formData.categoryId)
            };

            const response = await api.post('/api/products', productPayload);

            // 2. Initialize the Stock via inventory-service 
            // (This is an incredible admin feature shortcut!)
            if (formData.stockQuantity) {
                try {
                    await api.post('/api/inventory', {
                        skuCode: formData.skuCode,
                        quantity: parseInt(formData.stockQuantity, 10)
                    });
                    toast.success(`Product created with ${formData.stockQuantity} units in stock!`);
                } catch (invErr) {
                    toast.success('Product created, but stock initialization failed. Add stock manually.');
                }
            } else {
                toast.success('Product created successfully (0 stock)');
            }

            setIsCreating(false);
            setFormData({ name: '', description: '', price: '', skuCode: '', categoryId: 1, stockQuantity: '' });
            fetchProducts(); // Refresh table
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create product');
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-8">
            <div className="md:flex md:items-center md:justify-between mb-8">
                <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate flex items-center">
                        <PackageSearch className="w-8 h-8 mr-3 text-primary-600" />
                        Product Management
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Control the global catalog mapping directly to your Postgres database.
                    </p>
                </div>
                <div className="mt-4 flex md:mt-0 md:ml-4">
                    <button
                        onClick={() => setIsCreating(!isCreating)}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                    >
                        {isCreating ? 'Cancel' : <><Plus className="w-4 h-4 mr-2" /> Add Product</>}
                    </button>
                </div>
            </div>

            {isCreating && (
                <div className="bg-white shadow-sm border border-gray-200 sm:rounded-lg mb-8">
                    <div className="px-4 py-5 sm:p-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Create New Product</h3>
                        <form onSubmit={handleCreate} className="grid grid-cols-1 gap-y-6 sm:grid-cols-6 sm:gap-x-6">
                            <div className="sm:col-span-3">
                                <label className="block text-sm font-medium text-gray-700">Product Name</label>
                                <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                            </div>
                            <div className="sm:col-span-3">
                                <label className="block text-sm font-medium text-gray-700">SKU Code (Unique ID)</label>
                                <input required type="text" value={formData.skuCode} onChange={(e) => setFormData({ ...formData, skuCode: e.target.value.toUpperCase() })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm font-mono uppercase" />
                            </div>
                            <div className="sm:col-span-6">
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea required rows={2} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Price ($)</label>
                                <input required type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Category ID</label>
                                <input required type="number" value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Initial Stock (Inventory Service)</label>
                                <input type="number" placeholder="e.g. 50" value={formData.stockQuantity} onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })} className="mt-1 block w-full border border-rose-200 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-rose-500 focus:border-rose-500 bg-rose-50 sm:text-sm placeholder-rose-300" />
                                <p className="mt-1 text-xs text-rose-500">Auto-registers with Warehouse</p>
                            </div>

                            <div className="sm:col-span-6 flex justify-end">
                                <button type="submit" className="bg-primary-600 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                                    Save Product & Inventory
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Product List Table */}
            <div className="flex flex-col">
                <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                        <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name / Desc</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU Code</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {loading ? (
                                        <tr><td colSpan="4" className="text-center py-10"><Loader className="w-6 h-6 animate-spin mx-auto text-gray-400" /></td></tr>
                                    ) : products.length === 0 ? (
                                        <tr><td colSpan="4" className="text-center py-10 text-gray-500 font-medium">No products exist in database. Create one above!</td></tr>
                                    ) : (
                                        products.map((product) => (
                                            <tr key={product.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center font-bold text-gray-400 text-xs">
                                                            {(product.name || 'NA').substring(0, 2).toUpperCase()}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-bold text-gray-900">{product.name}</div>
                                                            <div className="text-sm text-gray-500 w-64 truncate">{product.description}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 bg-gray-50/50">
                                                    {product.skuCode}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                        <Tag className="w-3 h-3 mr-1 mt-0.5" /> {product.category || product.categoryId}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                                                    ${product.price?.toFixed(2)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
