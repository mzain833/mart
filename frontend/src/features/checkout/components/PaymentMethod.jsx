
import { Banknote, CreditCard } from "lucide-react";

const PaymentMethod = ({ value, onChange }) => {
  return (
    <section className="checkout-section">
      <div className="checkout-section-heading">
        <span className="checkout-section-number">04</span>
        <div>
          <h2>Payment Method</h2>
          <p>Choose how you would like to pay.</p>
        </div>
      </div>

      <label className="checkout-option">
        <input
          type="radio"
          name="paymentMethod"
          value="cod"
          checked={value === "cod"}
          onChange={() => onChange("cod")}
        />

        <span className="checkout-option-icon">
          <Banknote size={21} />
        </span>

        <span className="checkout-option-content">
          <strong>Cash on Delivery</strong>
          <small>Pay when your order arrives.</small>
        </span>

        <span className="checkout-option-check" />
      </label>

      <label className="checkout-option disabled-option">
        <input type="radio" disabled />

        <span className="checkout-option-icon">
          <CreditCard size={21} />
        </span>

        <span className="checkout-option-content">
          <strong>Online Payment</strong>
          <small>Secure online payments — coming soon.</small>
        </span>

        <span className="coming-soon-label">Coming Soon</span>
      </label>
    </section>
  );
};

export default PaymentMethod;
