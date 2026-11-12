
import { create } from "zustand";
import { persist } from "zustand/middleware";

const useShopStore = create(
  persist(
    (set) => ({
      cartItems: [],
      wishlistItems: [],

      addToCart: (product, quantity = 1) =>
        set((state) => {
          if (product.stock <= 0) return state;

          const existing = state.cartItems.find(
            (item) => item.product.id === product.id
          );

          if (existing) {
            return {
              cartItems: state.cartItems.map((item) =>
                item.product.id === product.id
                  ? {
                      ...item,
                      quantity: Math.min(
                        item.quantity + quantity,
                        product.stock
                      ),
                    }
                  : item
              ),
            };
          }

          return {
            cartItems: [
              ...state.cartItems,
              { product, quantity: Math.min(quantity, product.stock) },
            ],
          };
        }),

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
                  quantity: Math.max(
                    1,
                    Math.min(quantity, item.product.stock)
                  ),
                }
              : item
          ),
        })),

      toggleWishlist: (productId) =>
        set((state) => ({
          wishlistItems: state.wishlistItems.includes(productId)
            ? state.wishlistItems.filter((id) => id !== productId)
            : [...state.wishlistItems, productId],
        })),

      clearCart: () => set({ cartItems: [] }),
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
