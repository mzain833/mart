
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  Mail,
  Package,
  Phone,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  UserRound,
  XCircle,
} from "lucide-react";

import adminCustomerService from "../services/adminCustomerService";
import {
  formatOrderDate,
  formatOrderPrice,
  getOrderStatusLabel,
} from "../../orders/utils/orderUtils";

import "./admin-customer-details.css";

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "—"
    : formatOrderDate(date);
};

const getErrorMessage = (error) =>
  error.response?.data?.message ||
  error.message ||
  "Customer details load nahi ho sakin.";

const AdminCustomerDetails = () => {
  const { customerId } = useParams();

  const [customer, setCustomer] = useState(null);
  const [summary, setSummary] = useState({});
  const [recentOrders, setRecentOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadCustomer = useCallback(async (signal) => {
    setIsLoading(true);
    setError("");

    try {
      const result = await adminCustomerService.getCustomerById(
        customerId,
        { signal }
      );

      if (signal?.aborted) return;

      setCustomer(result.customer);
      setSummary(result.summary || {});
      setRecentOrders(result.recentOrders || []);
    } catch (requestError) {
      if (!signal?.aborted) {
        setError(getErrorMessage(requestError));
      }
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, [customerId]);

  useEffect(() => {
    const controller = new AbortController();

    loadCustomer(controller.signal);

    return () => controller.abort();
  }, [loadCustomer]);

  const handleStatusToggle = async () => {
    if (!customer || actionLoading) return;

    const nextStatus = !customer.isActive;

    const confirmed = window.confirm(
      nextStatus
        ? "Is customer account ko activate karna chahte hain?"
        : "Is customer account ko deactivate karna chahte hain?"
    );

    if (!confirmed) return;

    setActionLoading(true);
    setActionError("");
    setSuccessMessage("");

    try {
      const updatedCustomer =
        await adminCustomerService.updateCustomerStatus(
          customerId,
          nextStatus
        );

      setCustomer(updatedCustomer);

      setSuccessMessage(
        nextStatus
          ? "Customer account successfully activated."
          : "Customer account successfully deactivated."
      );
    } catch (requestError) {
      setActionError(getErrorMessage(requestError));
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <main className="admin-customer-details">
        <div className="admin-customer-details__loading">
          <LoaderCircle size={28} className="is-spinning" />
          Loading customer profile...
        </div>
      </main>
    );
  }

  if (error || !customer) {
    return (
      <main className="admin-customer-details">
        <div className="admin-customer-details__container">
          <Link to="/admin/customers" className="admin-customer-details__back">
            <ArrowLeft size={16} />
            Back to customers
          </Link>

          <div className="admin-customer-details__error">
            <XCircle size={30} />
            <h2>Unable to load customer</h2>
            <p>{error || "Requested customer nahi mila."}</p>

            <button
              type="button"
              onClick={() => loadCustomer()}
              className="admin-customer-details__primary"
            >
              <RefreshCw size={16} />
              Try again
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-customer-details">
      <div className="admin-customer-details__container">
        <header className="admin-customer-details__header">
          <div>
            <Link
              to="/admin/customers"
              className="admin-customer-details__back"
            >
              <ArrowLeft size={16} />
              Back to customers
            </Link>

            <span className="admin-customer-details__eyebrow">
              CUSTOMER MANAGEMENT
            </span>

            <h1>Customer Profile</h1>
            <p>Review account information and customer order activity.</p>
          </div>

          <span className="admin-customer-details__secure">
            <ShieldCheck size={16} />
            Admin access
          </span>
        </header>

        <section className="admin-customer-details__profile">
          <div className="admin-customer-details__identity">
            <div className="admin-customer-details__avatar">
              {(customer.fullName || "C").charAt(0).toUpperCase()}
            </div>

            <div>
              <h2>{customer.fullName}</h2>
              <p>{customer.email}</p>

              <span
                className={`admin-customer-details__status ${
                  customer.isActive ? "is-active" : "is-inactive"
                }`}
              >
                {customer.isActive ? "Active account" : "Inactive account"}
              </span>
            </div>
          </div>

          <button
            type="button"
            className={
              customer.isActive
                ? "admin-customer-details__deactivate"
                : "admin-customer-details__activate"
            }
            onClick={handleStatusToggle}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <LoaderCircle size={16} className="is-spinning" />
            ) : customer.isActive ? (
              <XCircle size={16} />
            ) : (
              <CheckCircle2 size={16} />
            )}

            {customer.isActive ? "Deactivate account" : "Activate account"}
          </button>
        </section>

        {actionError && (
          <div className="admin-customer-details__message is-error" role="alert">
            {actionError}
          </div>
        )}

        {successMessage && (
          <div className="admin-customer-details__message is-success" role="status">
            {successMessage}
          </div>
        )}

        <section className="admin-customer-details__stats">
          <article>
            <span className="admin-customer-details__stat-icon">
              <ShoppingBag size={20} />
            </span>
            <div>
              <span>Total orders</span>
              <strong>{summary.totalOrders ?? 0}</strong>
            </div>
          </article>

          <article>
            <span className="admin-customer-details__stat-icon">
              <CheckCircle2 size={20} />
            </span>
            <div>
              <span>Delivered</span>
              <strong>{summary.deliveredOrders ?? 0}</strong>
            </div>
          </article>

          <article>
            <span className="admin-customer-details__stat-icon">
              <Clock3 size={20} />
            </span>
            <div>
              <span>Active orders</span>
              <strong>{summary.activeOrders ?? 0}</strong>
            </div>
          </article>

          <article>
            <span className="admin-customer-details__stat-icon">
              <Package size={20} />
            </span>
            <div>
              <span>Total order value</span>
              <strong>{formatOrderPrice(summary.totalOrderValue)}</strong>
            </div>
          </article>
        </section>

        <div className="admin-customer-details__grid">
          <section className="admin-customer-details__card">
            <div className="admin-customer-details__card-heading">
              <UserRound size={19} />
              <h2>Account information</h2>
            </div>

            <div className="admin-customer-details__information">
              <div>
                <span>Full name</span>
                <strong>{customer.fullName}</strong>
              </div>

              <div>
                <span>Email address</span>
                <strong>
                  <Mail size={15} />
                  {customer.email}
                </strong>
              </div>

              <div>
                <span>Phone number</span>
                <strong>
                  <Phone size={15} />
                  {customer.phone || "Not available"}
                </strong>
              </div>

              <div>
                <span>Account role</span>
                <strong>Customer</strong>
              </div>

              <div>
                <span>Registration date</span>
                <strong>{formatDate(customer.createdAt)}</strong>
              </div>

              <div>
                <span>Last updated</span>
                <strong>{formatDate(customer.updatedAt)}</strong>
              </div>
            </div>
          </section>

          <section className="admin-customer-details__card">
            <div className="admin-customer-details__card-heading">
              <Clock3 size={19} />
              <h2>Order overview</h2>
            </div>

<div className="admin-customer-details__overview">
  <div>
    <span>Cancelled orders</span>
    <strong>{summary.cancelledOrders ?? 0}</strong>
  </div>

  <div>
    <span>Delivered orders</span>
    <strong>{summary.deliveredOrders ?? 0}</strong>
  </div>

  <div>
    <span>Active orders</span>
    <strong>{summary.activeOrders ?? 0}</strong>
  </div>

  <div>
    <span>Total order value</span>
    <strong>
      {formatOrderPrice(summary.totalOrderValue)}
    </strong>
  </div>

  <div>
    <span>Cancelled order value</span>
    <strong>
      {formatOrderPrice(summary.cancelledOrderValue)}
    </strong>
  </div>
</div>
          </section>

          <section className="admin-customer-details__card admin-customer-details__orders">
          <div className="admin-customer-details__card-heading">
            <div>
              <ShoppingBag size={19} />
              <h2>Recent orders</h2>
            </div>

            <span>Latest {recentOrders.length} orders</span>
          </div>

          {recentOrders.length === 0 ? (
            <div className="admin-customer-details__empty">
              <Package size={28} />
              <strong>No orders yet</strong>
              <span>This customer has not placed any registered orders.</span>
            </div>
          ) : (
            <div className="admin-customer-details__table-wrap">
              <table className="admin-customer-details__table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th />
                  </tr>
                </thead>

                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order._id}>
                      <td>
                        <strong>{order.orderNumber}</strong>
                      </td>

                      <td>{order.items?.length ?? 0}</td>

                      <td>{formatOrderPrice(order.total)}</td>

                      <td>
                        <span className="admin-customer-details__payment">
                          {order.paymentStatus || "Unknown"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`admin-customer-details__order-status status--${order.status}`}
                        >
                          {getOrderStatusLabel(order.status)}
                        </span>
                      </td>

                      <td>{formatDate(order.createdAt)}</td>

                      <td>
                        <Link
                          to={`/admin/orders/${order._id}`}
                          className="admin-customer-details__order-link"
                        >
                          View order
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
    </main>
  );
};

export default AdminCustomerDetails;
