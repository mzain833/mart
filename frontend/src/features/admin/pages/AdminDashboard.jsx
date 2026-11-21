
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Boxes,
  CircleDollarSign,
  ClipboardList,
  Package,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

import useAdminDashboard from "../hooks/useAdminDashboard";

import "./admin.css";

const MANAGEMENT_LINKS = [
  { label: "Products", path: "/admin/products", icon: Package },
  { label: "Categories", path: "/admin/categories", icon: Boxes },
  { label: "Orders", path: "/admin/orders", icon: ClipboardList },
  { label: "Customers", path: "/admin/customers", icon: Users },
];

const formatCurrency = (value = 0) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatNumber = (value = 0) =>
  new Intl.NumberFormat("en-PK").format(Number(value) || 0);

const formatDate = (date) => {
  if (!date || Number.isNaN(new Date(date).getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

const formatStatus = (status = "") =>
  status
    ? status.charAt(0).toUpperCase() + status.slice(1)
    : "Unknown";

const PAYMENT_LABELS = {
  paid: "Paid",
  pending: "Pending",
  failed: "Failed",
  refunded: "Refunded",
};

const statsConfig = [
  {
    key: "totalRevenue",
    label: "Paid Revenue",
    icon: CircleDollarSign,
    format: formatCurrency,
    description: "Successfully paid orders",
    color: "revenue",
  },
  {
    key: "totalOrderValue",
    label: "Total Order Value",
    icon: Wallet,
    format: formatCurrency,
    description: "All orders including cancelled",
    color: "orders",
  },
  {
    key: "cancelledOrderValue",
    label: "Cancelled Value",
    icon: XCircle,
    format: formatCurrency,
    description: "Value of cancelled orders",
    color: "cancelled",
  },
  {
    key: "totalOrders",
    label: "Total Orders",
    icon: ClipboardList,
    format: formatNumber,
    description: "All orders received",
    color: "total",
  },
  {
    key: "totalCancelledOrders",
    label: "Cancelled Orders",
    icon: AlertTriangle,
    format: formatNumber,
    description: "Orders cancelled",
    color: "warning",
  },
  {
    key: "activeOrders",
    label: "Active Orders",
    icon: Activity,
    format: formatNumber,
    description: "Orders currently in progress",
    color: "active",
  },
  {
    key: "totalProducts",
    label: "Active Products",
    icon: Package,
    format: formatNumber,
    description: "Products available in store",
    color: "products",
  },
  {
    key: "totalCustomers",
    label: "Registered Customers",
    icon: Users,
    format: formatNumber,
    description: "All registered customer accounts",
    color: "customers",
  },
  {
    key: "activeCustomers",
    label: "Active Customers",
    icon: Users,
    format: formatNumber,
    description: "Currently active accounts",
    color: "active-customers",
  },
  {
    key: "inactiveCustomers",
    label: "Inactive Customers",
    icon: Users,
    format: formatNumber,
    description: "Deactivated customer accounts",
    color: "inactive-customers",
  },
  {
    key: "lowStockCount",
    label: "Low Stock Items",
    icon: AlertTriangle,
    format: formatNumber,
    description: "Products requiring attention",
    color: "low-stock",
  },
];

const AdminDashboard = () => {
  const {
    dashboard,
    isLoading,
    error,
    refreshDashboard,
  } = useAdminDashboard();

  const stats = dashboard?.stats || {};
  const recentOrders = dashboard?.recentOrders || [];
  const lowStockProducts = dashboard?.lowStockProducts || [];

  return (
    <main className="admin-dashboard">
      <div className="admin-dashboard__container">
        <header className="admin-dashboard__header">
          <div>
            <span className="admin-dashboard__eyebrow">
              NEXAMART ADMINISTRATION
            </span>

            <h1>Dashboard Overview</h1>

            <p>
              Monitor business performance and manage your store operations.
            </p>
          </div>

          <div className="admin-dashboard__header-actions">
            <div className="admin-dashboard__security">
              <ShieldCheck size={17} />
              <span>Secure Administrator Access</span>
            </div>

            <button
              type="button"
              className="admin-dashboard__refresh"
              onClick={refreshDashboard}
              disabled={isLoading}
              aria-label="Refresh dashboard"
            >
              <RefreshCw
                size={16}
                className={isLoading ? "is-spinning" : ""}
              />
              <span>Refresh</span>
            </button>
          </div>
        </header>

        <nav
          className="admin-dashboard__quick-links"
          aria-label="Admin management"
        >
          {MANAGEMENT_LINKS.map(({ label, path, icon: Icon }) => (
            <Link to={path} key={path}>
              <span className="admin-dashboard__quick-icon">
                <Icon size={18} />
              </span>

              <span>{label}</span>

              <ArrowRight
                className="admin-dashboard__quick-arrow"
                size={15}
              />
            </Link>
          ))}
        </nav>

        {error && (
          <div className="admin-dashboard__error" role="alert">
            <AlertTriangle size={18} />
            <span>{error}</span>

            <button
              type="button"
              onClick={refreshDashboard}
              disabled={isLoading}
            >
              Try again
            </button>
          </div>
        )}

        <section className="admin-dashboard__section">
          <div className="admin-dashboard__section-heading">
            <div>
              <span className="admin-dashboard__section-eyebrow">
                BUSINESS INTELLIGENCE
              </span>
              <h2>Store Performance</h2>
              <p>Financial performance, operations and customer overview.</p>
            </div>

            <span className="admin-dashboard__live">
              <span />
              Dashboard data
            </span>
          </div>

          <div className="admin-dashboard__stats">
            {statsConfig.map((item) => {
              const Icon = item.icon;
              const value = stats[item.key] ?? 0;

              return (
                <article
                  className={`admin-stat admin-stat--${item.color}`}
                  key={item.key}
                >
                  <div className="admin-stat__top">
                    <span>{item.label}</span>

                    <div className="admin-stat__icon">
                      <Icon size={19} />
                    </div>
                  </div>

                  <strong>
                    {item.format ? item.format(value) : value}
                  </strong>

                  <p>{item.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="admin-dashboard__section admin-dashboard__section--tables">
          <div className="admin-dashboard__panel">
            <div className="admin-dashboard__panel-header">
              <div>
                <span className="admin-dashboard__panel-eyebrow">
                  ORDER ACTIVITY
                </span>
                <h2>Recent Orders</h2>
                <p>Latest customer transactions and payment status.</p>
              </div>

              <Link
                to="/admin/orders"
                className="admin-dashboard__panel-link"
              >
                View all
                <ArrowRight size={15} />
              </Link>
            </div>

            {isLoading && !dashboard ? (
              <div className="admin-dashboard__empty">
                Loading recent orders...
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="admin-dashboard__empty">
                <ShoppingBag size={27} />
                <strong>No orders yet</strong>
                <span>New customer orders will appear here.</span>
              </div>
            ) : (
              <div className="admin-dashboard__table-wrap">
                <table className="admin-dashboard__table">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Payment</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order._id}>
                        <td className="admin-dashboard__order-number">
                          <Link to={`/admin/orders/${order._id}`}>
                            {order.orderNumber || "View order"}
                          </Link>
                        </td>

                        <td>
                          <span className="admin-dashboard__customer-name">
                            {order.customer?.fullName || "Guest customer"}
                          </span>
                        </td>

                        <td className="admin-dashboard__amount">
                          {formatCurrency(order.total)}
                        </td>

                        <td>
                          <span
                            className={`admin-payment admin-payment--${order.paymentStatus || "pending"}`}
                          >
                            {PAYMENT_LABELS[order.paymentStatus] ||
                              formatStatus(order.paymentStatus)}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`admin-status admin-status--${order.status || "unknown"}`}
                          >
                            {formatStatus(order.status)}
                          </span>
                        </td>

                        <td className="admin-dashboard__date">
                          {formatDate(order.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="admin-dashboard__panel">
            <div className="admin-dashboard__panel-header">
              <div>
                <span className="admin-dashboard__panel-eyebrow">
                  INVENTORY CONTROL
                </span>
                <h2>Inventory Alerts</h2>
                <p>Products that need restocking attention.</p>
              </div>

              <Link
                to="/admin/products"
                className="admin-dashboard__panel-icon-link"
                aria-label="Manage products"
              >
                <Boxes size={19} />
              </Link>
            </div>

            {isLoading && !dashboard ? (
              <div className="admin-dashboard__empty">
                Loading inventory...
              </div>
            ) : lowStockProducts.length === 0 ? (
              <div className="admin-dashboard__empty">
                <Package size={27} />
                <strong>Inventory looks healthy</strong>
                <span>No low-stock products require attention.</span>
              </div>
            ) : (
              <div className="admin-inventory">
                {lowStockProducts.map((product) => (
                  <div
                    className="admin-inventory__item"
                    key={product._id}
                  >
                    <div className="admin-inventory__details">
                      <strong>{product.name}</strong>
                      <span>{product.sku}</span>
                    </div>

                    <span
                      className={`admin-inventory__stock ${
                        product.stock === 0 ? "is-out" : ""
                      }`}
                    >
                      {product.stock === 0
                        ? "Out of stock"
                        : `${product.stock} left`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <footer className="admin-dashboard__footer">
          <ShieldCheck size={15} />
          <span>NexaMart secure administration workspace</span>
        </footer>
      </div>
    </main>
  );
};

export default AdminDashboard;
