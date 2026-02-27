import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'react-hot-toast';

const useCart = create(
    persist(
        (set, get) => ({
            items: [],

            // Add an item to the cart, or increment if it already exists
            addItem: (product) => {
                const currentItems = get().items;
                const existingItem = currentItems.find((item) => item.productId === product.id);
                const stock = product.stockQuantity ?? 5;

                if (existingItem) {
                    // Check if we hit inventory limits (Assuming max 5 per customer for safety if missing stock data)
                    if (existingItem.quantity >= stock) {
                        toast.error(`Cannot add more. Only ${stock} in stock!`);
                        return;
                    }

                    set({
                        items: currentItems.map((item) =>
                            item.productId === product.id
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
                            skuCode: product.skuCode,
                            name: product.name,
                            price: product.price,
                            quantity: 1,
                            stockQuantity: product.stockQuantity,
                            // Keep original product data for rendering
                            product: product
                        }]
                    });
                    toast.success(`Added ${product.name} to cart`);
                }
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
                const stock = item?.product?.stockQuantity ?? 5;
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

            getTotalPrice: () => get().items.reduce((total, item) => total + (item.price * item.quantity), 0),
        }),
        {
            name: 'shopease-cart-storage', // key in localStorage
        }
    )
);

export default useCart;
