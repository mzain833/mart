
import { Check } from "lucide-react";

const steps = ["Information", "Delivery", "Payment"];

const CheckoutSteps = ({ activeStep = 1 }) => {
  return (
    <div className="checkout-steps">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < activeStep;
        const isActive = stepNumber === activeStep;

        return (
          <div
            className={`checkout-step ${
              isActive ? "active" : ""
            } ${isCompleted ? "completed" : ""}`}
            key={step}
          >
            <div className="checkout-step-indicator">
              {isCompleted ? <Check size={16} /> : stepNumber}
            </div>

            <span>{step}</span>
          </div>
        );
      })}
    </div>
  );
};

export default CheckoutSteps;
