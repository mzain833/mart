
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  Filter,
  LoaderCircle,
  Package,
  RefreshCw,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";

import useAdminOrders from "../hooks/useAdminOrders";
import {
  formatOrderDate,
  formatOrderPrice,
  getOrderStatusLabel,
} from "../../orders/utils/orderUtils";

import "./admin-orders.css";

const STATUS_OPTIONS = [
  ["", "All statuses"],
  ["placed", "Placed"],
  ["confirmed", "Confirmed"],
  ["processing", "Processing"],
  ["shipped", "Shipped"],
  ["delivered", "Delivered"],
  ["cancelled", "Cancelled"],
];

const PAYMENT_STATUS_OPTIONS = [
  ["", "All payment statuses"],
  ["pending", "Pending"],
  ["paid", "Paid"],
  ["failed", "Failed"],
  ["refunded", "Refunded"],
];

const PAYMENT_METHOD_OPTIONS = [
  ["", "All payment methods"],
  ["cod", "Cash on Delivery"],
];

const SORT_OPTIONS = [
  ["newest", "Newest first"],
  ["oldest", "Oldest first"],
  ["total_desc", "Highest amount"],
  ["total_asc", "Lowest amount"],
];

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "—"
    : formatOrderDate(date);
};

const getCustomerName = (order) =>
  order.customer?.fullName || "Guest customer";

const getCustomerEmail = (order) =>
  order.customer?.email || "No email available";

const getPaymentLabel = (status) =>
  ({
    pending: "Pending",
    paid: "Paid",
    failed: "Failed",
    refunded: "Refunded",
  })[status] || status || "Unknown";

const AdminOrders = () => {
  const {
    orders,
    filters,
    searchInput,
    setSearchInput,
    pagination,
    isLoading,
    error,
    updateFilter,
    applySearch,
    changePage,
    refreshOrders,
  } = useAdminOrders();

  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters = useMemo(
    () =>
      Boolean(
        filters.status ||
        filters.paymentStatus ||
        filters.paymentMethod ||
        filters.from ||
        filters.to ||
        filters.search
      ),
    [filters]
  );

  const clearFilters = () => {
    setSearchInput("");

    Object.entries({
      search: "",
      status: "",
      paymentStatus: "",
      paymentMethod: "",
      from: "",
      to: "",
      sort: "newest",
    }).forEach(([key, value]) => updateFilter(key, value));
  };

  return (
    <main className="admin-orders">
      <div className="admin-orders__container">
        <header className="admin-orders__header">
          <div className="admin-orders__heading">
            <Link to="/admin" className="admin-orders__back">
              <ArrowLeft size={16} />
              Dashboard
            </Link>

            <span className="admin-orders__eyebrow">
              NEXAMART ADMINISTRATION
            </span>

            <h1>Order Management</h1>

            <p>
              Monitor customer orders, review payments and manage
              fulfilment from one place.
            </p>
          </div>

          <div className="admin-orders__header-actions">
            <span className="admin-orders__secure">
              <ShieldCheck size={16} />
              Admin access
            </span>

            <button
              type="button"
              className="admin-orders__button admin-orders__button--secondary"
              onClick={refreshOrders}
              disabled={isLoading}
            >
              <RefreshCw
                size={16}
                className={isLoading ? "is-spinning" : ""}
              />
              Refresh
            </button>
          </div>
        </header>

        <section className="admin-orders__overview">
          <div className="admin-orders__overview-icon">
            <Package size={22} />
          </div>

          <div>
            <span>Matching orders</span>
            <strong>{pagination.total.toLocaleString("en-PK")}</strong>
            <small>
              {pagination.pages
                ? `Page ${pagination.page} of ${pagination.pages}`
                : "No pages available"}
            </small>
          </div>
        </section>

        <section className="admin-orders__panel">
          <div className="admin-orders__panel-header">
            <div>
              <h2>All orders</h2>
              <p>Search and filter your order records.</p>
            </div>

            <button
              type="button"
              className="admin-orders__filter-toggle"
              onClick={() => setShowFilters((previous) => !previous)}
              aria-expanded={showFilters}
            >
              <Filter size={16} />
              Filters
            </button>
          </div>

          <form
            className="admin-orders__search"
            onSubmit={applySearch}
          >
            <Search size={18} />

            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search order number, customer, email or phone..."
              aria-label="Search orders"
            />

            {searchInput && (
              <button
                type="button"
                className="admin-orders__clear-search"
                onClick={() => {
                  setSearchInput("");
                  updateFilter("search", "");
                }}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}

            <button type="submit" className="admin-orders__search-submit">
              Search
            </button>
          </form>

          {showFilters && (
            <div className="admin-orders__filters">
              <label>
                Order status
                <select
                  value={filters.status}
                  onChange={(event) =>
                    updateFilter("status", event.target.value)
                  }
                >
                  {STATUS_OPTIONS.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Payment status
                <select
                  value={filters.paymentStatus}
                  onChange={(event) =>
                    updateFilter("paymentStatus", event.target.value)
                  }
                >
                  {PAYMENT_STATUS_OPTIONS.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Payment method
                <select
                  value={filters.paymentMethod}
                  onChange={(event) =>
                    updateFilter("paymentMethod", event.target.value)
                  }
                >
                  {PAYMENT_METHOD_OPTIONS.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                From date
                <input
                  type="date"
                  value={filters.from}
                  onChange={(event) =>
                    updateFilter("from", event.target.value)
                  }
                />
              </label>

              <label>
                To date
                <input
                  type="date"
                  value={filters.to}
                  min={filters.from || undefined}
                  onChange={(event) =>
                    updateFilter("to", event.target.value)
                  }
                />
              </label>

              <label>
                Sort by
                <select
                  value={filters.sort}
                  onChange={(event) =>
                    updateFilter("sort", event.target.value)
                  }
                >
                  {SORT_OPTIONS.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>

              {hasActiveFilters && (
                <button
                  type="button"
                  className="admin-orders__reset"
                  onClick={clearFilters}
                >
                  <X size={15} />
                  Clear filters
                </button>
              )}
            </div>
          )}

          {error && (
            <div className="admin-orders__error" role="alert">
              <span>{error}</span>

              <button type="button" onClick={refreshOrders}>
                Try again
              </button>
            </div>
          )}

          <div className="admin-orders__table-wrap">
            <table className="admin-orders__table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="7" className="admin-orders__state">
                      <LoaderCircle className="is-spinning" size={24} />
                      <span>Loading orders...</span>
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="admin-orders__state">
                      <Package size={28} />
                      <strong>No orders found</strong>
                      <span>
                        Try changing your search or filter criteria.
                      </span>
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order._id}>
                      <td>
                        <Link
                          className="admin-orders__order-link"
                          to={`/admin/orders/${order._id}`}
                        >
                          {order.orderNumber || order._id}
                        </Link>
                      </td>

                      <td>
                        <div className="admin-orders__customer">
                          <strong>{getCustomerName(order)}</strong>
                          <span>{getCustomerEmail(order)}</span>
                        </div>
                      </td>

                      <td className="admin-orders__amount">
                        {formatOrderPrice(order.total)}
                      </td>

                      <td>
                        <span
                          className={`admin-orders__payment admin-orders__payment--${order.paymentStatus || "unknown"}`}
                        >
                          {getPaymentLabel(order.paymentStatus)}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`admin-orders__status admin-orders__status--${order.status || "unknown"}`}
                        >
                          {getOrderStatusLabel(order.status)}
                        </span>
                      </td>

                      <td className="admin-orders__date">
                        {formatDate(order.createdAt)}
                      </td>

                      <td>
                        <Link
                          to={`/admin/orders/${order._id}`}
                          className="admin-orders__view"
                          aria-label={`View order ${order.orderNumber || ""}`}
                        >
                          <Eye size={17} />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <footer className="admin-orders__pagination">
            <span>
              Showing {orders.length} of {pagination.total} orders
            </span>

            <div>
              <button
                type="button"
                onClick={() => changePage(pagination.page - 1)}
                disabled={
                  isLoading ||
                  !pagination.hasPreviousPage ||
                  pagination.page <= 1
                }
                aria-label="Previous page"
              >
                <ArrowLeft size={16} />
                Previous
              </button>

              <span>
                {pagination.page} / {Math.max(pagination.pages, 1)}
              </span>

              <button
                type="button"
                onClick={() => changePage(pagination.page + 1)}
                disabled={isLoading || !pagination.hasNextPage}
                aria-label="Next page"
              >
                Next
                <ArrowRight size={16} />
              </button>
            </div>
          </footer>
        </section>
      </div>
    </main>
  );
};

export default AdminOrders;
