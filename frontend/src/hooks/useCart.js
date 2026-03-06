import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'react-hot-toast';

const DEFAULT_STOCK_LIMIT = 5;

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
                const stock = product.stockQuantity || product.quantity || DEFAULT_STOCK_LIMIT;

                if (existingItem) {
                    // Check if we hit inventory limits (Assuming max 5 per customer for safety if missing stock data)
                    if (existingItem.quantity >= stock) {
                        toast.error(`Cannot add more. Only ${stock} in stock!`);
                        return;
                    }

                    set({
                        items: currentItems.map((item) =>
                            String(item.productId) === String(product.id)
                                ? { ...item, quantity: item.quantity + 1 }
                                : item
                        )
                    });
                    toast.success(`Increased ${product.name} quantity`);
                } else {
                    if (stock <= 0) {
                        toast.error('This product is out of stock');
                        return;
                    }

                    set({
                        items: [...currentItems, {
                            productId: product.id,
                            skuCode: product.skuCode || product.sku,
                            name: product.name,
                            price: product.price,
                            quantity: product.quantity || 1,
                            stockQuantity: stock,
                            // Keep original product data for rendering
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

            // Remove item completely
            removeItem: (productId) => {
                set({
                    items: get().items.filter((item) => item.productId !== productId)
                });
                toast.success('Item removed from cart');
            },

            // Update specific quantity
            updateQuantity: (productId, quantity) => {
                if (quantity < 1) {
                    get().removeItem(productId);
                    return;
                }

                const item = get().items.find((i) => i.productId === productId);
                const stock = item?.product?.stockQuantity ?? DEFAULT_STOCK_LIMIT;
                if (quantity > stock) {
                    toast.error(`Cannot set quantity above ${stock} (stock limit)`);
                    return;
                }

                set({
                    items: get().items.map((item) =>
                        item.productId === productId ? { ...item, quantity } : item
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
