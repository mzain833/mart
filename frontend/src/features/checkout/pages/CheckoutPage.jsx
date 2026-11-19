import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingBag } from "lucide-react";

import MainLayout from "../../../layouts/MainLayout";
import useShopStore from "../../../store/useShopStore";
import useAccount from "../../account/hooks/useAccount";
import orderService from "../../orders/services/orderService";

import CustomerInformation from "../components/CustomerInformation";
import ShippingAddressForm from "../components/ShippingAddressForm";
import DeliveryMethod from "../components/DeliveryMethod";
import PaymentMethod from "../components/PaymentMethod";
import OrderSummary from "../components/OrderSummary";

import "../checkout.css";

const CHECKOUT_FORM_ID = "nexamart-checkout-form";
const GUEST_ORDER_TOKEN_PREFIX = "nexamart-guest-order:";

const INITIAL_FORM_VALUES = {
  fullName: "",
  email: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  province: "",
  postalCode: "",
};

const validateForm = (values) => {
  const errors = {};

  if (values.fullName.trim().length < 3) {
    errors.fullName = "Please enter your full name.";
  }

  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())
  ) {
    errors.email = "Please enter a valid email address.";
  }

  if (values.phone.trim().length < 7) {
    errors.phone = "Please enter a valid phone number.";
  }

  if (values.addressLine1.trim().length < 5) {
    errors.addressLine1 = "Please enter your complete street address.";
  }

  if (values.city.trim().length < 2) {
    errors.city = "Please enter your city.";
  }

  if (values.province.trim().length < 2) {
    errors.province = "Please enter your province.";
  }

  if (values.postalCode.trim().length < 2) {
    errors.postalCode = "Please enter your postal code.";
  }

  return errors;
};

const getOrderId = (order) => order?._id || order?.id;

const CheckoutPage = () => {
  const navigate = useNavigate();

  const cartItems = useShopStore((state) => state.cartItems);
  const clearCart = useShopStore((state) => state.clearCart);

  const { currentUser } = useAccount();

  const [formValues, setFormValues] = useState(() => ({
    ...INITIAL_FORM_VALUES,
  }));

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [deliveryMethod, setDeliveryMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("cod");

  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (total, item) =>
          total + Number(item.product?.price || 0) * item.quantity,
        0
      ),
    [cartItems]
  );

  useEffect(() => {
    if (!currentUser) return;

    setFormValues((previous) => ({
      ...previous,
      fullName:
        previous.fullName ||
        currentUser.fullName ||
        currentUser.name ||
        "",
      email: previous.email || currentUser.email || "",
      phone: previous.phone || currentUser.phone || "",
    }));
  }, [currentUser]);

  const handleFieldChange = (field, value) => {
    setFormValues((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrors((previous) => {
      if (!previous[field]) return previous;

      const updated = { ...previous };
      delete updated[field];

      return updated;
    });

    setSubmitError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting) return;

    if (!cartItems.length) {
      setSubmitError("Your cart is empty.");
      return;
    }

    const validationErrors = validateForm(formValues);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSubmitError("Please correct the highlighted fields.");
      return;
    }

    setErrors({});
    setSubmitError("");
    setSubmitting(true);

    try {
      const result = await orderService.createOrder({
        customer: {
          fullName: formValues.fullName.trim(),
          email: formValues.email.trim(),
          phone: formValues.phone.trim(),
          addressLine1: formValues.addressLine1.trim(),
          addressLine2: formValues.addressLine2.trim(),
          city: formValues.city.trim(),
          province: formValues.province.trim(),
          postalCode: formValues.postalCode.trim(),
        },
        items: cartItems,
        deliveryMethod,
        paymentMethod,
      });

      const orderId = getOrderId(result.order);

      if (!orderId) {
        throw new Error(
          "Order was created, but its confirmation ID is missing."
        );
      }

      if (result.guestAccessToken) {
        try {
          sessionStorage.setItem(
            `${GUEST_ORDER_TOKEN_PREFIX}${orderId}`,
            result.guestAccessToken
          );
        } catch {
          // Order creation remains successful if browser storage is unavailable.
        }
      }

      clearCart();

      navigate(`/order-confirmation/${orderId}`, {
        replace: true,
      });
    } catch (error) {
      setSubmitError(
        error.response?.data?.message ||
          error.message ||
          "Unable to place your order. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!cartItems.length) {
    return (
      <MainLayout>
        <div className="checkout-page">
          <div className="checkout-container">
            <div className="checkout-empty">
              <ShoppingBag size={42} />

              <h2>Your cart is empty</h2>

              <p>
                Add products to your cart before proceeding to checkout.
              </p>

              <Link to="/shop" className="checkout-submit-button">
                Explore Products
              </Link>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="checkout-page">
        <div className="checkout-container">
          <Link to="/cart" className="checkout-back-link">
            <ArrowLeft size={17} />
            Back to Cart
          </Link>

          <div className="checkout-header">
            <div>
              <span className="checkout-eyebrow">SECURE CHECKOUT</span>
              <h1>Complete Your Order</h1>
              <p>
                Provide your details to place your NexaMart order.
              </p>
            </div>
          </div>

          <div className="checkout-layout">
            <main className="checkout-main">
              <form
                id={CHECKOUT_FORM_ID}
                className="checkout-form"
                onSubmit={handleSubmit}
                noValidate
              >
                <CustomerInformation
                  values={formValues}
                  errors={errors}
                  onChange={handleFieldChange}
                />

                <ShippingAddressForm
                  values={formValues}
                  errors={errors}
                  onChange={handleFieldChange}
                />

                <DeliveryMethod
                  value={deliveryMethod}
                  onChange={setDeliveryMethod}
                />

                <PaymentMethod
                  value={paymentMethod}
                  onChange={setPaymentMethod}
                />

                {submitError && (
                  <div className="checkout-error-message" role="alert">
                    {submitError}
                  </div>
                )}
              </form>
            </main>

            <aside className="checkout-sidebar">
              <OrderSummary
                items={cartItems}
                subtotal={subtotal}
                submitting={submitting}
              />
            </aside>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CheckoutPage;