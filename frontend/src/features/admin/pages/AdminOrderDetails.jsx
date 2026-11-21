
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  MapPin,
  Package,
  RefreshCw,
  ShieldCheck,
  X,
  XCircle,
} from "lucide-react";

import adminOrderService from "../services/adminOrderService";
import {
  formatOrderDate,
  formatOrderPrice,
  getOrderStatusLabel,
} from "../../orders/utils/orderUtils";

import "./admin-order-details.css";

const STATUS_TRANSITIONS = {
  placed: ["confirmed"],
  confirmed: ["processing"],
  processing: ["shipped"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

const CANCELLABLE_STATUSES = ["placed", "confirmed", "processing"];

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "—"
    : formatOrderDate(date);
};

const getPaymentLabel = (status) =>
  ({
    pending: "Pending",
    paid: "Paid",
    failed: "Failed",
    refunded: "Refunded",
  })[status] || status || "Unknown";

const getPaymentMethodLabel = (method) =>
  ({
    cod: "Cash on Delivery",
  })[method] || method || "—";

const getCustomer = (order) => order?.customer || {};

const getItemName = (item) =>
  item.name ||
  item.productName ||
  item.product?.name ||
  item.sku ||
  "Product";

const getItemImage = (item) =>
  item.image || item.product?.image || "";

const getItemQuantity = (item) => Number(item.quantity) || 0;

const getItemPrice = (item) =>
  Number(item.unitPrice ?? item.price) || 0;

const getItemTotal = (item) =>
  Number(item.lineTotal) || getItemPrice(item) * getItemQuantity(item);

const getErrorMessage = (error) =>
  error.response?.data?.message ||
  error.message ||
  "Request complete nahi ho saki. Dobara koshish karein.";

const AdminOrderDetails = () => {
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [nextStatus, setNextStatus] = useState("");
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const loadOrder = useCallback(async (signal) => {
    setIsLoading(true);
    setError("");

    try {
      const result = await adminOrderService.getOrderById(
        orderId,
        { signal }
      );

      if (!signal?.aborted) {
        setOrder(result);
        setNextStatus("");
      }
    } catch (requestError) {
      if (!signal?.aborted) {
        setError(getErrorMessage(requestError));
      }
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, [orderId]);

  useEffect(() => {
    const controller = new AbortController();

    loadOrder(controller.signal);

    return () => controller.abort();
  }, [loadOrder]);

  const handleStatusUpdate = async (event) => {
    event.preventDefault();

    if (!nextStatus || actionLoading) return;

    setActionLoading(true);
    setActionError("");

    try {
      const updatedOrder = await adminOrderService.updateOrderStatus(
        orderId,
        { status: nextStatus }
      );

      if (updatedOrder) {
        setOrder(updatedOrder);
        setNextStatus("");
      } else {
        await loadOrder();
      }
    } catch (requestError) {
      setActionError(getErrorMessage(requestError));
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelOrder = async (event) => {
    event.preventDefault();

    const reason = cancelReason.trim();

    if (reason.length < 5 || reason.length > 500 || actionLoading) {
      return;
    }

    setActionLoading(true);
    setActionError("");

    try {
      const updatedOrder = await adminOrderService.cancelOrder(
        orderId,
        reason
      );

      if (updatedOrder) {
        setOrder(updatedOrder);
      } else {
        await loadOrder();
      }

      setShowCancelDialog(false);
      setCancelReason("");
    } catch (requestError) {
      setActionError(getErrorMessage(requestError));
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <main className="admin-order-details">
        <div className="admin-order-details__loading">
          <LoaderCircle size={28} />
          <span>Loading order details...</span>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="admin-order-details">
        <div className="admin-order-details__container">
          <Link to="/admin/orders" className="admin-order-details__back">
            <ArrowLeft size={16} />
            Back to orders
          </Link>

          <div className="admin-order-details__error">
            <XCircle size={30} />
            <h2>Unable to load order</h2>
            <p>{error || "Requested order nahi mila."}</p>

            <button
              type="button"
              onClick={() => loadOrder()}
              className="admin-order-details__primary-button"
            >
              <RefreshCw size={16} />
              Try again
            </button>
          </div>
        </div>
      </main>
    );
  }

  const customer = getCustomer(order);
  const items = Array.isArray(order.items) ? order.items : [];
  const allowedStatuses = STATUS_TRANSITIONS[order.status] || [];
  const canCancel = CANCELLABLE_STATUSES.includes(order.status);

  const addressLines = [
    customer.addressLine1,
    customer.addressLine2,
    customer.city,
    customer.province,
    customer.postalCode,
  ].filter(Boolean);

  const deliveryFee = Number(order.deliveryFee) || 0;
  const subtotal = Number(order.subtotal) || 0;
  const total = Number(order.total) || 0;

  const history = Array.isArray(order.statusHistory)
    ? [...order.statusHistory].reverse()
    : [];

  return (
    <main className="admin-order-details">
      <div className="admin-order-details__container">
        <header className="admin-order-details__header">
          <div>
            <Link
              to="/admin/orders"
              className="admin-order-details__back"
            >
              <ArrowLeft size={16} />
              Back to orders
            </Link>

            <span className="admin-order-details__eyebrow">
              ORDER MANAGEMENT
            </span>

            <h1>Order Details</h1>

            <p>
              Review order information and manage its fulfilment.
            </p>
          </div>

          <span className="admin-order-details__secure">
            <ShieldCheck size={16} />
            Admin access
          </span>
        </header>

        <section className="admin-order-details__order-banner">
          <div>
            <span>ORDER REFERENCE</span>
            <h2>{order.orderNumber || order._id}</h2>
            <p>Placed on {formatDate(order.createdAt)}</p>
          </div>

          <span
            className={`admin-order-details__status admin-order-details__status--${order.status}`}
          >
            {getOrderStatusLabel(order.status)}
          </span>
        </section>

        {actionError && (
          <div className="admin-order-details__action-error" role="alert">
            <span>{actionError}</span>
            <button
              type="button"
              onClick={() => setActionError("")}
              aria-label="Dismiss error"
            >
              <X size={17} />
            </button>
          </div>
        )}

        <div className="admin-order-details__grid">
          <div className="admin-order-details__main">
            <section className="admin-order-details__card">
              <div className="admin-order-details__card-heading">
                <div>
                  <Package size={19} />
                  <h2>Ordered items</h2>
                </div>

                <span>{items.length} products</span>
              </div>

              {items.length === 0 ? (
                <p className="admin-order-details__muted">
                  No order items available.
                </p>
              ) : (
                <div className="admin-order-details__items">
                  {items.map((item, index) => (
                    <div
                      className="admin-order-details__item"
                      key={item._id || item.productId || `${item.sku}-${index}`}
                    >
                      <div className="admin-order-details__item-image">
                        {getItemImage(item) ? (
                          <img
                            src={getItemImage(item)}
                            alt={getItemName(item)}
                            loading="lazy"
                          />
                        ) : (
                          <Package size={22} />
                        )}
                      </div>

                      <div className="admin-order-details__item-info">
                        <strong>{getItemName(item)}</strong>
                        <span>SKU: {item.sku || "—"}</span>
                        <small>
                          {getItemQuantity(item)} ×{" "}
                          {formatOrderPrice(getItemPrice(item))}
                        </small>
                      </div>

                      <strong className="admin-order-details__item-total">
                        {formatOrderPrice(getItemTotal(item))}
                      </strong>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="admin-order-details__card">
              <div className="admin-order-details__card-heading">
                <div>
                  <Clock3 size={19} />
                  <h2>Order history</h2>
                </div>
              </div>

              {history.length === 0 ? (
                <p className="admin-order-details__muted">
                  No status history available.
                </p>
              ) : (
                <div className="admin-order-details__history">
                  {history.map((entry, index) => (
                    <div
                      className="admin-order-details__history-item"
                      key={entry._id || `${entry.status}-${index}`}
                    >
                      <span className="admin-order-details__history-marker">
                        <CheckCircle2 size={16} />
                      </span>

                      <div>
                        <strong>
                          {getOrderStatusLabel(entry.status)}
                        </strong>

                        <span>{formatDate(entry.changedAt || entry.createdAt)}</span>

                        {entry.note && <p>{entry.note}</p>}
                        {entry.reason && <p>{entry.reason}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <aside className="admin-order-details__sidebar">
            <section className="admin-order-details__card">
              <div className="admin-order-details__card-heading">
                <h2>Customer information</h2>
              </div>

              <div className="admin-order-details__information">
                <strong>{customer.fullName || "Guest customer"}</strong>
                <span>{customer.email || "No email available"}</span>
                <span>{customer.phone || "No phone available"}</span>
              </div>
            </section>

            <section className="admin-order-details__card">
              <div className="admin-order-details__card-heading">
                <div>
                  <MapPin size={19} />
                  <h2>Delivery address</h2>
                </div>
              </div>

              <div className="admin-order-details__information">
                {addressLines.length > 0 ? (
                  addressLines.map((line, index) => (
                    <span key={`${line}-${index}`}>{line}</span>
                  ))
                ) : (
                  <span>Address not available</span>
                )}
              </div>
            </section>

            <section className="admin-order-details__card">
              <div className="admin-order-details__card-heading">
                <h2>Payment summary</h2>
              </div>

              <div className="admin-order-details__information">
                <span>
                  Method: {getPaymentMethodLabel(order.paymentMethod)}
                </span>

                <span>
                  Payment status:{" "}
                  <strong>{getPaymentLabel(order.paymentStatus)}</strong>
                </span>
              </div>

              <div className="admin-order-details__summary">
                <div>
                  <span>Subtotal</span>
                  <strong>{formatOrderPrice(subtotal)}</strong>
                </div>

                <div>
                  <span>Delivery fee</span>
                  <strong>
                    {order.deliveryFee == null
                      ? "To be confirmed"
                      : formatOrderPrice(deliveryFee)}
                  </strong>
                </div>

                <div className="admin-order-details__grand-total">
                  <span>Order total</span>
                  <strong>{formatOrderPrice(total)}</strong>
                </div>
              </div>
            </section>

            <section className="admin-order-details__card">
              <div className="admin-order-details__card-heading">
                <h2>Manage order</h2>
              </div>

              {allowedStatuses.length > 0 ? (
                <form
                  className="admin-order-details__actions"
                  onSubmit={handleStatusUpdate}
                >
                  <label htmlFor="next-order-status">
                    Update order status
                  </label>

                  <select
                    id="next-order-status"
                    value={nextStatus}
                    onChange={(event) => setNextStatus(event.target.value)}
                    disabled={actionLoading}
                    required
                  >
                    <option value="">Select next status</option>

                    {allowedStatuses.map((status) => (
                      <option key={status} value={status}>
                        {getOrderStatusLabel(status)}
                      </option>
                    ))}
                  </select>

                  <button
                    type="submit"
                    className="admin-order-details__primary-button"
                    disabled={!nextStatus || actionLoading}
                  >
                    {actionLoading ? (
                      <LoaderCircle size={16} />
                    ) : (
                      <CheckCircle2 size={16} />
                    )}
                    Update status
                  </button>
                </form>
              ) : (
                <p className="admin-order-details__muted">
                  This order has reached its final status.
                </p>
              )}

              {canCancel && (
                <button
                  type="button"
                  className="admin-order-details__cancel-button"
                  onClick={() => {
                    setActionError("");
                    setShowCancelDialog(true);
                  }}
                  disabled={actionLoading}
                >
                  <XCircle size={16} />
                  Cancel order
                </button>
              )}

              <button
                type="button"
                className="admin-order-details__refresh"
                onClick={() => loadOrder()}
                disabled={actionLoading}
              >
                <RefreshCw size={15} />
                Refresh order
              </button>
            </section>
          </aside>
        </div>
      </div>

      {showCancelDialog && (
        <div
          className="admin-order-details__modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !actionLoading
            ) {
              setShowCancelDialog(false);
            }
          }}
        >
          <section
            className="admin-order-details__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-order-title"
          >
            <div className="admin-order-details__modal-heading">
              <div>
                <span className="admin-order-details__modal-icon">
                  <XCircle size={21} />
                </span>

                <div>
                  <h2 id="cancel-order-title">Cancel this order?</h2>
                  <p>
                    This action will restore the reserved product stock.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowCancelDialog(false)}
                disabled={actionLoading}
                aria-label="Close dialog"
              >
                <X size={19} />
              </button>
            </div>

            <form
              className="admin-order-details__cancel-form"
              onSubmit={handleCancelOrder}
            >
              <label htmlFor="admin-cancel-reason">
                Cancellation reason
              </label>

              <textarea
                id="admin-cancel-reason"
                value={cancelReason}
                onChange={(event) => setCancelReason(event.target.value)}
                placeholder="Enter a clear reason for cancelling this order..."
                rows={4}
                minLength={5}
                maxLength={500}
                required
                disabled={actionLoading}
              />

              <span className="admin-order-details__character-count">
                {cancelReason.trim().length}/500 characters
              </span>

              <div className="admin-order-details__modal-actions">
                <button
                  type="button"
                  className="admin-order-details__secondary-button"
                  onClick={() => setShowCancelDialog(false)}
                  disabled={actionLoading}
                >
                  Keep order
                </button>

                <button
                  type="submit"
                  className="admin-order-details__danger-button"
                  disabled={
                    actionLoading ||
                    cancelReason.trim().length < 5 ||
                    cancelReason.trim().length > 500
                  }
                >
                  {actionLoading && (
                    <LoaderCircle size={16} />
                  )}
                  Confirm cancellation
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
};

export default AdminOrderDetails;
