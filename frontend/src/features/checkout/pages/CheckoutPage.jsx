
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingBag } from "lucide-react";

import MainLayout from "../../../layouts/MainLayout";
import useShopStore from "../../../store/useShopStore";
import useAccount from "../../account/hooks/useAccount";

import orderService from "../../orders/services/orderService";
import CheckoutSteps from "../components/CheckoutSteps";
import CustomerInformation from "../components/CustomerInformation";
import ShippingAddressForm from "../components/ShippingAddressForm";
import DeliveryMethod from "../components/DeliveryMethod";
import PaymentMethod from "../components/PaymentMethod";
import OrderSummary from "../components/OrderSummary";

import validateCheckoutForm from "../utils/checkoutValidation";
import "../checkout.css";

const initialFormValues = {
  fullName: "",
  email: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  province: "",
  postalCode: "",
};

const CheckoutPage = () => {
  const navigate = useNavigate();

  const cartItems = useShopStore((state) => state.cartItems);
  const clearCart = useShopStore((state) => state.clearCart);

  const { currentUser } = useAccount();

  const [formValues, setFormValues] = useState(() => ({
    ...initialFormValues,
    ...(currentUser
      ? {
          fullName: currentUser.fullName || "",
          email: currentUser.email || "",
          phone: currentUser.phone || "",
        }
      : {}),
  }));

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [deliveryMethod, setDeliveryMethod] = useState("standard");
  const [submitting, setSubmitting] = useState(false);

  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (total, item) =>
          total + Number(item.product.price || 0) * item.quantity,
        0
      ),
    [cartItems]
  );

  const handleChange = (field, value) => {
    setFormValues((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [field]: "",
    }));

    setSubmitError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting || cartItems.length === 0) return;

    const validationErrors = validateCheckoutForm(formValues);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      const firstError = document.querySelector(
        '[aria-invalid="true"]'
      );

      firstError?.focus();
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      const customerId =
        currentUser?.email?.toLowerCase() ===
        formValues.email.trim().toLowerCase()
          ? currentUser.id
          : null;

      const order = await orderService.createOrder({
        customer: formValues,
        customerId,
        items: cartItems,
        deliveryMethod,
        paymentMethod,
      });

      clearCart();

      navigate(`/order-confirmation/${order.id}`, {
        replace: true,
      });
    } catch (error) {
      setSubmitError(
        error.message || "Unable to place your order."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <main className="checkout-page">
        <div className="checkout-container">
          <div className="checkout-breadcrumb">
            <Link to="/cart">
              <ArrowLeft size={16} />
              Back to Cart
            </Link>
          </div>

          <div className="checkout-page-heading">
            <span className="checkout-eyebrow">
              SECURE CHECKOUT
            </span>
            <h1>Complete Your Order</h1>
            <p>
              Just a few details between you and your purchase.
            </p>
          </div>

          <CheckoutSteps activeStep={1} />

          {cartItems.length === 0 ? (
            <div className="checkout-empty">
              <ShoppingBag size={42} />
              <h2>Your cart is empty</h2>
              <p>
                Add products to your cart before proceeding to checkout.
              </p>
              <Link to="/shop" className="checkout-empty-button">
                Explore Products
              </Link>
            </div>
          ) : (
            <div className="checkout-layout">
              <form
                id="nexamart-checkout-form"
                className="checkout-form"
                onSubmit={handleSubmit}
                noValidate
              >
                {submitError && (
                  <p className="checkout-error" role="alert">
                    {submitError}
                  </p>
                )}

                <CustomerInformation
                  values={formValues}
                  errors={errors}
                  onChange={handleChange}
                />

                <ShippingAddressForm
                  values={formValues}
                  errors={errors}
                  onChange={handleChange}
                />

                <DeliveryMethod
                  value={deliveryMethod}
                  onChange={setDeliveryMethod}
                />

                <PaymentMethod
                  value={paymentMethod}
                  onChange={setPaymentMethod}
                />
              </form>

              <OrderSummary
                items={cartItems}
                subtotal={subtotal}
                submitting={submitting}
              />
            </div>
          )}
        </div>
      </main>
    </MainLayout>
  );
};

export default CheckoutPage;
