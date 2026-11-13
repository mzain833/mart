
import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";

const formatPrice = (amount) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(amount);

const OrderSummary = ({ items, subtotal, submitting }) => {
  const totalItems = items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <aside className="checkout-summary">
      <div className="checkout-summary-heading">
        <h2>Order Summary</h2>
        <span>{totalItems} items</span>
      </div>

      <div className="checkout-summary-products">
        {items.map(({ product, quantity }) => (
          <div className="checkout-summary-product" key={product.id}>
            <div className="checkout-product-image">
              <img src={product.image} alt={product.name} />
              <span>{quantity}</span>
            </div>

            <div className="checkout-product-info">
              <strong>{product.name}</strong>
              <small>{formatPrice(product.price)}</small>
            </div>

            <strong className="checkout-product-total">
              {formatPrice(Number(product.price) * quantity)}
            </strong>
          </div>
        ))}
      </div>

      <div className="checkout-summary-divider" />

      <div className="checkout-summary-row">
        <span>Subtotal</span>
        <strong>{formatPrice(subtotal)}</strong>
      </div>

      <div className="checkout-summary-row">
        <span>Delivery</span>
        <span>To be confirmed</span>
      </div>

      <div className="checkout-summary-total">
        <span>Order Total</span>
        <strong>{formatPrice(subtotal)}</strong>
      </div>

      <p className="checkout-summary-note">
        Delivery charges will be confirmed before dispatch. The amount
        shown above is the product subtotal only.
      </p>

      <button
        type="submit"
        form="nexamart-checkout-form"
        className="checkout-submit-button"
        disabled={submitting || items.length === 0}
      >
        <ShoppingBag size={18} />
        {submitting ? "Processing..." : "Place Order"}
      </button>

      <Link to="/shop" className="checkout-continue-link">
        Continue Shopping
      </Link>

      <div className="checkout-security-note">
        Your information is handled securely.
      </div>
    </aside>
  );
};

export default OrderSummary;
