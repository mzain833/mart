
import { Truck } from "lucide-react";

const DeliveryMethod = ({ value, onChange }) => {
  return (
    <section className="checkout-section">
      <div className="checkout-section-heading">
        <span className="checkout-section-number">03</span>
        <div>
          <h2>Delivery Method</h2>
          <p>Select your preferred delivery option.</p>
        </div>
      </div>

      <label className="checkout-option selected">
        <input
          type="radio"
          name="deliveryMethod"
          value="standard"
          checked={value === "standard"}
          onChange={() => onChange("standard")}
        />

        <span className="checkout-option-icon">
          <Truck size={21} />
        </span>

        <span className="checkout-option-content">
          <strong>Standard Delivery</strong>
          <small>Delivery charges will be confirmed before dispatch.</small>
        </span>

        <span className="checkout-option-check" />
      </label>
    </section>
  );
};

export default DeliveryMethod;
