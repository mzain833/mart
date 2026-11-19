
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Boxes,
  CircleDollarSign,
  ClipboardList,
  Package,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import useAdminDashboard from "../hooks/useAdminDashboard";
import "./admin.css";

const formatCurrency = (value = 0) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (date) =>
  new Intl.DateTimeFormat("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));

const formatStatus = (status = "") =>
  status.charAt(0).toUpperCase() + status.slice(1);

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
    icon: ShoppingBag,
    format: formatCurrency,
    description: "Value of non-cancelled orders",
    color: "orders",
  },
  {
    key: "totalOrders",
    label: "Total Orders",
    icon: ClipboardList,
    description: "All orders received",
    color: "total",
  },
  {
    key: "activeOrders",
    label: "Active Orders",
    icon: Activity,
    description: "Orders currently in progress",
    color: "active",
  },
  {
    key: "totalProducts",
    label: "Active Products",
    icon: Package,
    description: "Products available in store",
    color: "products",
  },
  {
    key: "totalCustomers",
    label: "Customers",
    icon: Users,
    description: "Active registered customers",
    color: "customers",
  },
  {
    key: "lowStockCount",
    label: "Low Stock Items",
    icon: AlertTriangle,
    description: "Products requiring attention",
    color: "warning",
  },
];

const AdminDashboard = () => {
  const {
    dashboard,
    isLoading,
    error,
    refreshDashboard,
  } = useAdminDashboard();

  const stats = dashboard?.stats;
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
              Monitor your store performance and manage operations.
            </p>
          </div>

          <div className="admin-dashboard__header-actions">
            <div className="admin-dashboard__security">
              <ShieldCheck size={18} />
              <span>Authorized Administrator</span>
              <Link
  to="/admin/products"
  className="admin-dashboard__manage-products"
>
  <Package size={17} />
  <span>Manage Products</span>
</Link>
            </div>

            <button
              type="button"
              className="admin-dashboard__refresh"
              onClick={refreshDashboard}
              disabled={isLoading}
              aria-label="Refresh dashboard"
            >
              <RefreshCw
                size={17}
                className={isLoading ? "is-spinning" : ""}
              />
              <span>Refresh</span>
            </button>
          </div>
        </header>

        {error && (
          <div className="admin-dashboard__error" role="alert">
            <AlertTriangle size={19} />
            <span>{error}</span>

            <button type="button" onClick={refreshDashboard}>
              Try again
            </button>
          </div>
        )}

        <section className="admin-dashboard__section">
          <div className="admin-dashboard__section-heading">
            <div>
              <h2>Store Performance</h2>
              <p>Your store's key business metrics.</p>
            </div>

            <span className="admin-dashboard__live">
              <span />
              Live data
            </span>
          </div>

          <div className="admin-dashboard__stats">
            {statsConfig.map((item) => {
              const Icon = item.icon;
              const value = stats?.[item.key] ?? 0;

              return (
                <article
                  className={`admin-stat admin-stat--${item.color}`}
                  key={item.key}
                >
                  <div className="admin-stat__top">
                    <span>{item.label}</span>

                    <div className="admin-stat__icon">
                      <Icon size={20} />
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
                <h2>Recent Orders</h2>
                <p>Latest customer transactions.</p>
              </div>

              <ClipboardList size={20} />
            </div>

            {isLoading && !dashboard ? (
              <div className="admin-dashboard__empty">
                Loading orders...
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="admin-dashboard__empty">
                No orders available yet.
              </div>
            ) : (
              <div className="admin-dashboard__table-wrap">
                <table className="admin-dashboard__table">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order._id}>
                        <td className="admin-dashboard__order-number">
                          {order.orderNumber}
                        </td>

                        <td>{order.customer?.fullName || "Customer"}</td>

                        <td className="admin-dashboard__amount">
                          {formatCurrency(order.total)}
                        </td>

                        <td>
                          <span
                            className={`admin-status admin-status--${order.status}`}
                          >
                            {formatStatus(order.status)}
                          </span>
                        </td>

                        <td>{formatDate(order.createdAt)}</td>
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
                <h2>Inventory Alerts</h2>
                <p>Products requiring restocking.</p>
              </div>

              <Boxes size={20} />
            </div>

            {isLoading && !dashboard ? (
              <div className="admin-dashboard__empty">
                Loading inventory...
              </div>
            ) : lowStockProducts.length === 0 ? (
              <div className="admin-dashboard__empty">
                <Package size={28} />
                <span>All inventory levels look healthy.</span>
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
          <ShieldCheck size={16} />
          <span>NexaMart secure administration workspace</span>
        </footer>
      </div>
    </main>
  );
};

export default AdminDashboard;
