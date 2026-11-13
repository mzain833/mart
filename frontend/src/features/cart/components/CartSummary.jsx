
import { Link } from "react-router-dom";

const formatPrice = (amount) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(amount);

export default function CartSummary({ subtotal, totalItems }) {
  return (
    <aside className="cart-summary">
      <h2 className="cart-summary__title">
        Order Summary
      </h2>

      <div className="cart-summary__row">
        <span>Items ({totalItems})</span>
        <span>{formatPrice(subtotal)}</span>
      </div>

      <div className="cart-summary__row">
        <span>Shipping</span>
        <span>Calculated at checkout</span>
      </div>

      <div className="cart-summary__divider" />

      <div className="cart-summary__total">
        <span>Subtotal</span>
        <strong>{formatPrice(subtotal)}</strong>
      </div>

     
    
       <Link to="/checkout" className="cart-summary-checkout">
  Proceed to Checkout
</Link>
      
       
     

      <Link to="/shop" className="cart-summary__continue">
        Continue Shopping
      </Link>

      <p className="cart-summary__note">
        Final shipping charges will be calculated during checkout.
      </p>
    </aside>
  );
}
