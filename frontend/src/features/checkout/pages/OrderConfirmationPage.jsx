
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle2, PackageCheck } from "lucide-react";

import MainLayout from "../../../layouts/MainLayout";
import orderService from "../../orders/services/orderService";
import {
  formatOrderPrice,
  formatOrderDate,
  getOrderStatusLabel,
} from "../../orders/utils/orderUtils";

import "../checkout.css";

const GUEST_ORDER_TOKEN_PREFIX = "nexamart-guest-order:";

const getErrorMessage = (error) =>
  error.response?.data?.message ||
  error.message ||
  "Unable to load your order details.";

const getItemName = (item) =>
  item.product?.name ||
  item.productName ||
  item.name ||
  item.sku ||
  "Product";

const getItemLineTotal = (item) =>
  Number(
    item.lineTotal ??
      item.totalPrice ??
      Number(item.unitPrice ?? item.price ?? item.product?.price ?? 0) *
        Number(item.quantity ?? 0)
  );

const OrderConfirmationPage = () => {
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadOrder = async () => {
      setLoading(true);
      setError("");
      setOrder(null);

      try {
        const guestAccessToken = sessionStorage.getItem(
          `${GUEST_ORDER_TOKEN_PREFIX}${orderId}`
        );

        const result = guestAccessToken
          ? await orderService.getGuestOrderConfirmation(
              orderId,
              guestAccessToken
            )
          : await orderService.getMyOrderById(orderId);

        if (!result) {
          throw new Error("Order details could not be found.");
        }

        if (isMounted) {
          setOrder(result);
        }
      } catch (requestError) {
        if (isMounted) {
          setError(getErrorMessage(requestError));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (orderId) {
      loadOrder();
    } else {
      setError("Invalid order reference.");
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [orderId]);

  const renderUnavailableState = (title, message) => (
    <div className="confirmation-card">
      <PackageCheck size={48} />
      <h1>{title}</h1>
      <p>{message}</p>

      <Link to="/shop" className="confirmation-button">
        Continue Shopping
      </Link>
    </div>
  );

  return (
    <MainLayout>
      <main className="confirmation-page">
        <div className="confirmation-container">
          {loading ? (
            renderUnavailableState(
              "Loading Your Order",
              "Please wait while we retrieve your order details."
            )
          ) : error || !order ? (
            renderUnavailableState(
              "Order Details Unavailable",
              error ||
                "This order could not be found. Please check your order history."
            )
          ) : (
            <div className="confirmation-card">
              <div className="confirmation-icon">
                <CheckCircle2 size={48} />
              </div>

              <span className="checkout-eyebrow">
                NEXAMART ORDER
              </span>

              <h1>Thank You for Your Order!</h1>

              <p>
                Your order has been successfully placed.
              </p>

              <div className="confirmation-order-number">
                <span>Order Reference</span>
                <strong>{order.orderNumber || order._id}</strong>
              </div>

              <div className="confirmation-details">
                <div>
                  <span>Customer</span>
                  <strong>
                    {order.customer?.fullName || "Customer"}
                  </strong>
                </div>

                <div>
                  <span>Order Status</span>
                  <strong>
                    {getOrderStatusLabel(order.status)}
                  </strong>
                </div>

                <div>
                  <span>Order Date</span>
                  <strong>
                    {formatOrderDate(order.createdAt)}
                  </strong>
                </div>

                <div>
                  <span>Payment Method</span>
                  <strong>
                    {order.paymentMethod === "cod"
                      ? "Cash on Delivery"
                      : "Online Payment"}
                  </strong>
                </div>

                <div>
                  <span>Delivery Method</span>
                  <strong>
                    {order.deliveryMethod === "standard"
                      ? "Standard Delivery"
                      : order.deliveryMethod}
                  </strong>
                </div>

                <div>
                  <span>Product Subtotal</span>
                  <strong>
                    {formatOrderPrice(order.subtotal)}
                  </strong>
                </div>
              </div>

              <div>
  <span>Delivery Charges</span>
  <strong>
    {order.deliveryFee != null
      ? formatOrderPrice(order.deliveryFee)
      : "Unavailable"}
  </strong>
</div>

<div>
  <span>Delivery Area</span>
  <strong>
    {[
      order.shipping?.area || order.customer?.area,
      order.shipping?.city || order.customer?.city,
    ]
      .filter(Boolean)
      .join(", ")}
  </strong>
</div>

              <div className="confirmation-order-items">
                <h3>Ordered Products</h3>

                {(order.items || []).map((item, index) => (
                  <div
                    className="confirmation-item"
                    key={item._id || item.sku || index}
                  >
                    <span>
                      {getItemName(item)} × {item.quantity}
                    </span>

                    <strong>
                      {formatOrderPrice(getItemLineTotal(item))}
                    </strong>
                  </div>
                ))}
              </div>

              <div className="confirmation-order-total">
                <span>Order Total</span>
                <strong>
                  {formatOrderPrice(order.total)}
                </strong>
              </div>

              <p className="confirmation-note">
  Your order and delivery charges have been securely confirmed.
  Please keep your order reference for future communication.
</p>

              <Link to="/shop" className="confirmation-button">
                Continue Shopping
              </Link>
            </div>
          )}
        </div>
      </main>
    </MainLayout>
  );
};

export default OrderConfirmationPage;
