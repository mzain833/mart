
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  XCircle,
} from "lucide-react";

import MainLayout from "../../../layouts/MainLayout";
import useAccount from "../../account/hooks/useAccount";
import AccountHeader from "../../account/components/AccountHeader";
import AccountSidebar from "../../account/components/AccountSidebar";

import useOrders from "../hooks/useOrders";
import orderService from "../services/orderService";

import OrderStatusTimeline from "../components/OrderStatusTimeline";
import CancelOrderDialog from "../components/CancelOrderDialog";

import {
  formatOrderPrice,
  formatOrderDate,
  getOrderStatusLabel,
} from "../utils/orderUtils";

import "../../account/account.css";

const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const { currentUser } = useAccount();
  const { orders } = useOrders(currentUser?.email);

  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");

  const order = orders.find((item) => item.id === orderId);

  const canCancel =
    order &&
    ["placed", "confirmed", "processing"].includes(order.status);

  const handleCancelOrder = (reason) => {
    if (!order || cancelling) return;

    setCancelling(true);
    setCancelError("");

    try {
      orderService.cancelOrder(order.id, reason);
      setShowCancelDialog(false);
    } catch (error) {
      setCancelError(
        error.message || "Unable to cancel your order."
      );
    } finally {
      setCancelling(false);
    }
  };

  return (
    <MainLayout>
      <main className="account-page">
        <div className="account-container">
          <AccountHeader
            title="Order Details"
            description="Review your order and delivery information."
            user={currentUser}
          />

          <div className="account-layout">
            <AccountSidebar />

            <section className="account-content">
              {!order ? (
                <div className="account-panel">
                  <h2>Order Not Found</h2>
                  <p>This order is unavailable in your account.</p>

                  <Link
                    to="/account/orders"
                    className="account-primary-button"
                  >
                    <ArrowLeft size={17} />
                    Back to Orders
                  </Link>
                </div>
              ) : (
                <div className="account-panel order-details-panel">
                  <Link
                    to="/account/orders"
                    className="order-back-link"
                  >
                    <ArrowLeft size={16} />
                    Back to Orders
                  </Link>

                  <div className="order-details-heading">
                    <div>
                      <span>Order Reference</span>
                      <h2>{order.orderNumber}</h2>
                      <p>{formatOrderDate(order.createdAt)}</p>
                    </div>

                    <span
                      className={`order-status order-status-${order.status}`}
                    >
                      {getOrderStatusLabel(order.status)}
                    </span>
                  </div>

                  <OrderStatusTimeline order={order} />

                  {canCancel && (
                    <div className="order-cancellation">
                      <div>
                        <strong>Need to cancel this order?</strong>
                        <p>
                          You can cancel before the order is shipped.
                        </p>
                      </div>

                      <button
                        type="button"
                        className="order-cancel-button"
                        onClick={() => setShowCancelDialog(true)}
                      >
                        <XCircle size={17} />
                        Cancel Order
                      </button>
                    </div>
                  )}

                  {cancelError && (
                    <p className="checkout-error" role="alert">
                      {cancelError}
                    </p>
                  )}

                  <div className="order-details-section">
                    <h3>
                      <Package size={19} />
                      Ordered Products
                    </h3>

                    {order.items.map((item, index) => (
                      <div
                        className="order-detail-product"
                        key={`${item.product.id}-${index}`}
                      >
                        <div>
                          <strong>{item.product.name}</strong>
                          <span>Quantity: {item.quantity}</span>
                        </div>

                        <strong>
                          {formatOrderPrice(item.lineTotal)}
                        </strong>
                      </div>
                    ))}
                  </div>

                  <div className="order-details-section">
                    <h3>
                      <MapPin size={19} />
                      Shipping Address
                    </h3>

                    <p>
                      {order.customer.fullName}
                      <br />
                      {order.customer.addressLine1}
                      {order.customer.addressLine2 && (
                        <>
                          <br />
                          {order.customer.addressLine2}
                        </>
                      )}
                      <br />
                      {order.customer.city},{" "}
                      {order.customer.province}
                      {order.customer.postalCode && (
                        <> - {order.customer.postalCode}</>
                      )}
                      <br />
                      {order.customer.phone}
                    </p>
                  </div>

                  <div className="order-details-section">
                    <h3>
                      <CreditCard size={19} />
                      Payment Information
                    </h3>

                    <div className="order-detail-product">
                      <span>Payment Method</span>
                      <strong>
                        {order.paymentMethod === "cod"
                          ? "Cash on Delivery"
                          : "Online Payment"}
                      </strong>
                    </div>

                    <div className="order-detail-product">
                      <span>Payment Status</span>
                      <strong>
                        {order.paymentStatus === "paid"
                          ? "Paid"
                          : "Pending"}
                      </strong>
                    </div>

                    <div className="order-detail-product">
                      <span>Product Subtotal</span>
                      <strong>
                        {formatOrderPrice(order.subtotal)}
                      </strong>
                    </div>

                    <div className="order-detail-product">
                      <span>Delivery Charges</span>
                      <strong>To be confirmed</strong>
                    </div>

                    <div className="order-detail-total">
                      <span>Order Total</span>
                      <strong>
                        {formatOrderPrice(order.total)}
                      </strong>
                    </div>
                  </div>

                  <p className="order-details-note">
                    Order status is currently managed by the frontend
                    demo system. Live courier tracking will be
                    integrated with the backend.
                  </p>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      <CancelOrderDialog
        open={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={handleCancelOrder}
        loading={cancelling}
      />
    </MainLayout>
  );
};

export default OrderDetailsPage;
