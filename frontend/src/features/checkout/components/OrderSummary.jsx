import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";

const formatPrice = (amount) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(amount);

const OrderSummary = ({
  items,
  subtotal,
  submitting,
  shippingQuote,
  shippingQuoteLoading,
  shippingQuoteError,
}) => {
  const totalItems = items.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const deliveryFee = shippingQuote?.deliveryFee ?? null;
  const estimatedTotal =
    deliveryFee === null ? null : subtotal + deliveryFee;

  const canPlaceOrder =
    Boolean(shippingQuote) &&
    !shippingQuoteLoading &&
    !shippingQuoteError &&
    !submitting &&
    items.length > 0;

  return (
    <aside className="checkout-summary">
      <div className="checkout-summary-heading">
        <h2>Order Summary</h2>
        <span>{totalItems} items</span>
      </div>

      <div className="checkout-summary-products">
        {items.map(({ product, quantity }) => (
          <div
            className="checkout-summary-product"
            key={product.id}
          >
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

        <strong>
          {shippingQuoteLoading
            ? "Calculating..."
            : deliveryFee !== null
              ? formatPrice(deliveryFee)
              : "Not available"}
        </strong>
      </div>

      {shippingQuoteError && (
        <p className="checkout-error" role="alert">
          {shippingQuoteError}
        </p>
      )}

      <div className="checkout-summary-total">
        <span>Order Total</span>

        <strong>
          {estimatedTotal !== null
            ? formatPrice(estimatedTotal)
            : "—"}
        </strong>
      </div>

      <p className="checkout-summary-note">
        Delivery charges are calculated according to your delivery area.
        Final charges are verified securely when your order is placed.
      </p>

      <button
        type="submit"
        form="nexamart-checkout-form"
        className="checkout-submit-button"
        disabled={!canPlaceOrder}
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