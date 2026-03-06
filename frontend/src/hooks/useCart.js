import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'react-hot-toast';

const DEFAULT_STOCK_LIMIT = 99;

const useCart = create(
    persist(
        (set, get) => ({
            items: [],
            isSyncing: false,

            // Add an item to the cart, or increment if it already exists
            addItem: (product) => {
                if (!product.id) {
                    console.error('addItem: Missing product id', product);
                    return;
                }
                const currentItems = get().items;
                // Normalize IDs to handle string/number mismatch
                const existingItem = currentItems.find((item) => String(item.productId) === String(product.id));
                const stock = Number(product.stockQuantity || product.quantity || DEFAULT_STOCK_LIMIT);

                if (existingItem) {
                    if (existingItem.quantity >= stock) {
                        toast.error(`Stock limit reached! Only ${stock} available.`);
                        return;
                    }

                    set({
                        items: currentItems.map((item) =>
                            String(item.productId) === String(product.id)
                                ? { ...item, quantity: item.quantity + 1 }
                                : item
                        )
                    });
                    toast.success(`Updated ${product.name} quantity`);
                } else {
                    if (stock <= 0) {
                        toast.error('Out of stock');
                        return;
                    }

                    set({
                        items: [...currentItems, {
                            productId: product.id,
                            skuCode: product.skuCode || product.sku,
                            name: product.name,
                            price: product.price,
                            quantity: 1,
                            stockQuantity: stock,
                            product: product
                        }]
                    });
                    toast.success(`Added ${product.name} to cart`);
                }
            },

            // Set items directly (used for backend sync)
            setItems: (items) => {
                set({ items: Array.isArray(items) ? items : [] });
            },

            // Merge items (used for guest -> user transitions)
            mergeItems: (backendItems) => {
                const localItems = get().items;
                const mergedMap = new Map();

                // Start with local items (guest cart)
                localItems.forEach(item => mergedMap.set(String(item.productId), { ...item }));

                // Merge backend items
                backendItems.forEach(backendItem => {
                    const id = String(backendItem.productId);
                    if (mergedMap.has(id)) {
                        // If exists in both, prefer higher quantity or sum (taking sum for better UX)
                        const existing = mergedMap.get(id);
                        const newQty = Math.min(existing.quantity + backendItem.quantity, backendItem.stockQuantity || DEFAULT_STOCK_LIMIT);
                        mergedMap.set(id, { ...existing, quantity: newQty });
                    } else {
                        mergedMap.set(id, { ...backendItem });
                    }
                });

                set({ items: Array.from(mergedMap.values()) });
            },

            // Remove item completely
            removeItem: (productId) => {
                set({
                    items: get().items.filter((item) => String(item.productId) !== String(productId))
                });
                toast.success('Item removed');
            },

            // Update specific quantity
            updateQuantity: (productId, quantity) => {
                const id = String(productId);
                if (quantity < 1) {
                    get().removeItem(id);
                    return;
                }

                const item = get().items.find((i) => String(i.productId) === id);
                const stock = Number(item?.stockQuantity || DEFAULT_STOCK_LIMIT);

                if (quantity > stock) {
                    toast.error(`Only ${stock} units available`);
                    return;
                }

                set({
                    items: get().items.map((item) =>
                        String(item.productId) === id ? { ...item, quantity } : item
                    )
                });
            },

            // Clear the entire cart (used after successful checkout)
            clearCart: () => {
                set({ items: [] });
            },

            // Utilities
            getTotalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),

            getSubtotal: () => get().items.reduce((total, item) => total + (item.price * item.quantity), 0),

            getShipping: () => {
                const subtotal = get().getSubtotal();
                if (subtotal === 0) return 0;
                return subtotal > 5000 ? 0 : 500;
            },

            getTax: () => {
                const subtotal = get().getSubtotal();
                return Math.round((subtotal * 0.18) * 100) / 100; // 18% GST rounded to 2 decimal places
            },

            getTotalAmount: () => {
                const subtotal = get().getSubtotal();
                const shipping = get().getShipping();
                const tax = get().getTax();
                return Math.round((subtotal + shipping + tax) * 100) / 100;
            },

            // Legacy support
            getTotalPrice: () => get().getSubtotal(),
        }),
        {
            name: 'shopease-cart-storage', // key in localStorage
        }
    )
);

export default useCart;
