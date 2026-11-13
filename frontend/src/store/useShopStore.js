
import { create } from "zustand";
import { persist } from "zustand/middleware";

const getValidQuantity = (quantity, stock) => {
  const value = Math.trunc(Number(quantity) || 1);

  return Math.max(1, Math.min(value, stock));
};

const useShopStore = create(
  persist(
    (set, get) => ({
      // State
      cartItems: [],
      wishlistItems: [],

      // Cart Actions
      addToCart: (product, quantity = 1) => {
        if (!product?.id || !Number.isFinite(Number(product.stock))) {
          return;
        }

        const stock = Math.max(0, Math.trunc(Number(product.stock)));

        if (stock <= 0) return;

        const validQuantity = getValidQuantity(quantity, stock);

        set((state) => {
          const existingItem = state.cartItems.find(
            (item) => item.product.id === product.id
          );

          if (existingItem) {
            return {
              cartItems: state.cartItems.map((item) =>
                item.product.id === product.id
                  ? {
                      ...item,
                      product,
                      quantity: getValidQuantity(
                        item.quantity + validQuantity,
                        stock
                      ),
                    }
                  : item
              ),
            };
          }

          return {
            cartItems: [
              ...state.cartItems,
              {
                product,
                quantity: validQuantity,
              },
            ],
          };
        });
      },

      removeFromCart: (productId) =>
        set((state) => ({
          cartItems: state.cartItems.filter(
            (item) => item.product.id !== productId
          ),
        })),

      updateQuantity: (productId, quantity) =>
        set((state) => ({
          cartItems: state.cartItems.map((item) =>
            item.product.id === productId
              ? {
                  ...item,
                  quantity: getValidQuantity(
                    quantity,
                    Math.max(1, Number(item.product.stock) || 1)
                  ),
                }
              : item
          ),
        })),

      clearCart: () => set({ cartItems: [] }),

      // Wishlist Actions
      toggleWishlist: (productId) =>
        set((state) => ({
          wishlistItems: state.wishlistItems.includes(productId)
            ? state.wishlistItems.filter((id) => id !== productId)
            : [...state.wishlistItems, productId],
        })),

      removeFromWishlist: (productId) =>
        set((state) => ({
          wishlistItems: state.wishlistItems.filter(
            (id) => id !== productId
          ),
        })),

      // Cart Calculations
      getCartCount: () =>
        get().cartItems.reduce(
          (total, item) => total + item.quantity,
          0
        ),

      getCartSubtotal: () =>
        get().cartItems.reduce(
          (total, item) =>
            total + Number(item.product.price || 0) * item.quantity,
          0
        ),

      getWishlistCount: () => get().wishlistItems.length,
    }),
    {
      name: "nexamart-shop-v1",

      partialize: (state) => ({
        cartItems: state.cartItems,
        wishlistItems: state.wishlistItems,
      }),
    }
  )
);

export default useShopStore;
