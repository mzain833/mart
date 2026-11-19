
import { useCallback, useEffect, useState } from "react";
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

import orderService from "../services/orderService";

import OrderStatusTimeline from "../components/OrderStatusTimeline";
import CancelOrderDialog from "../components/CancelOrderDialog";

import {
  formatOrderPrice,
  formatOrderDate,
  getOrderStatusLabel,
} from "../utils/orderUtils";

import "../../account/account.css";

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

const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const { currentUser } = useAccount();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");

  const loadOrder = useCallback(async () => {
    if (!orderId) {
      setLoadError("Invalid order reference.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError("");

    try {
      const result = await orderService.getMyOrderById(orderId);

      if (!result) {
        throw new Error("Order details could not be found.");
      }

      setOrder(result);
    } catch (error) {
      setOrder(null);
      setLoadError(
        error.response?.data?.message ||
          error.message ||
          "Unable to load order details."
      );
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const canCancel =
    order &&
    ["placed", "confirmed", "processing"].includes(order.status);

  const handleCancelOrder = async (reason) => {
    if (!order || cancelling) return;

    setCancelling(true);
    setCancelError("");

    try {
      const updatedOrder = await orderService.cancelOrder(
        order._id || order.id,
        reason
      );

      if (updatedOrder) {
        setOrder(updatedOrder);
      } else {
        await loadOrder();
      }

      setShowCancelDialog(false);
    } catch (error) {
      setCancelError(
        error.response?.data?.message ||
          error.message ||
          "Unable to cancel your order."
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
              {loading ? (
                <div className="account-panel">
                  <h2>Loading Order Details</h2>
                  <p>Please wait while we retrieve your order.</p>
                </div>
              ) : loadError || !order ? (
                <div className="account-panel">
                  <h2>Order Not Found</h2>
                  <p>
                    {loadError ||
                      "This order is unavailable in your account."}
                  </p>

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
                        <strong>
                          Need to cancel this order?
                        </strong>
                        <p>
                          You can cancel before the order is shipped.
                        </p>
                      </div>

                      <button
                        type="button"
                        className="order-cancel-button"
                        onClick={() => {
                          setCancelError("");
                          setShowCancelDialog(true);
                        }}
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

                    {(order.items || []).map((item, index) => (
                      <div
                        className="order-detail-product"
                        key={item._id || item.sku || index}
                      >
                        <div>
                          <strong>{getItemName(item)}</strong>
                          <span>Quantity: {item.quantity}</span>
                        </div>

                        <strong>
                          {formatOrderPrice(getItemLineTotal(item))}
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
                      {order.customer?.fullName}
                      <br />
                      {order.customer?.addressLine1}

                      {order.customer?.addressLine2 && (
                        <>
                          <br />
                          {order.customer.addressLine2}
                        </>
                      )}

                      <br />
                      {order.customer?.city},{" "}
                      {order.customer?.province}

                      {order.customer?.postalCode && (
                        <> - {order.customer.postalCode}</>
                      )}

                      <br />
                      {order.customer?.phone}
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
                      <strong>
                        {order.deliveryFee == null
                          ? "To be confirmed"
                          : formatOrderPrice(order.deliveryFee)}
                      </strong>
                    </div>

                    <div className="order-detail-total">
                      <span>Order Total</span>
                      <strong>
                        {formatOrderPrice(order.total)}
                      </strong>
                    </div>
                  </div>

                  <p className="order-details-note">
                    Your order information is retrieved securely
                    from NexaMart's backend.
                  </p>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      <CancelOrderDialog
        open={showCancelDialog}
        onClose={() => {
          if (!cancelling) {
            setShowCancelDialog(false);
          }
        }}
        onConfirm={handleCancelOrder}
        loading={cancelling}
      />
    </MainLayout>
  );
};

export default OrderDetailsPage;
