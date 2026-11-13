
import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";

import MainLayout from "../../../layouts/MainLayout";
import useShopStore from "../../../store/useShopStore";

import CartItem from "../components/CartItem";
import CartSummary from "../components/CartSummary";

import "../cart.css";

export default function CartPage() {
  const cartItems = useShopStore((state) => state.cartItems);
  const updateQuantity = useShopStore(
    (state) => state.updateQuantity
  );
  const removeFromCart = useShopStore(
    (state) => state.removeFromCart
  );

  const totalItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const subtotal = cartItems.reduce(
    (total, item) =>
      total + Number(item.product.price || 0) * item.quantity,
    0
  );

  return (
    <MainLayout>
      <section className="cart-page">
        <div className="cart-page__container">
          <div className="cart-page__heading">
            <div>
              <span className="cart-page__eyebrow">
                YOUR SHOPPING BAG
              </span>

              <h1>Shopping Cart</h1>

              <p>
                Review your selected products before checkout.
              </p>
            </div>

            <Link to="/shop" className="cart-page__back">
              Continue Shopping
            </Link>
          </div>

          {cartItems.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty__icon">
                <ShoppingBag size={34} />
              </div>

              <h2>Your cart is empty</h2>

              <p>
                Discover something you love and add it to your bag.
              </p>

              <Link to="/shop" className="cart-empty__button">
                Explore Products
              </Link>
            </div>
          ) : (
            <div className="cart-layout">
              <div className="cart-items">
                <div className="cart-items__header">
                  <h2>Your Items</h2>
                  <span>{totalItems} items</span>
                </div>

                {cartItems.map((item) => (
                  <CartItem
                    key={item.product.id}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeFromCart}
                  />
                ))}
              </div>

              <CartSummary
                subtotal={subtotal}
                totalItems={totalItems}
              />
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
}
