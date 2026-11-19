
import { Link } from "react-router-dom";
import {
  Package,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";

import MainLayout from "../../../layouts/MainLayout";
import useAccount from "../hooks/useAccount";
import AccountHeader from "../components/AccountHeader";
import AccountSidebar from "../components/AccountSidebar";

import useOrders from "../../orders/hooks/useOrders";
import {
  formatOrderPrice,
  formatOrderDate,
  getOrderStatusLabel,
} from "../../orders/utils/orderUtils";

import "../account.css";

const getOrderId = (order) => order._id || order.id;

const MyOrdersPage = () => {
  const { currentUser } = useAccount();

  const {
    orders,
    loading,
    error,
    refreshOrders,
  } = useOrders();

  return (
    <MainLayout>
      <main className="account-page">
        <div className="account-container">
          <AccountHeader
            title="My Orders"
            description="View and manage your purchases."
            user={currentUser}
          />

          <div className="account-layout">
            <AccountSidebar />

            <section className="account-content">
              <div className="account-panel">
                <div className="account-panel-heading">
                  <h2>Order History</h2>

                  <p>
                    {loading
                      ? "Loading your orders..."
                      : `${orders.length} order(s) found.`}
                  </p>
                </div>

                {loading ? (
                  <div className="account-empty-state">
                    <Package size={32} />
                    <h3>Loading Orders</h3>
                    <p>Please wait while we retrieve your purchases.</p>
                  </div>
                ) : error ? (
                  <div
                    className="account-empty-state"
                    role="alert"
                  >
                    <Package size={32} />
                    <h3>Unable to Load Orders</h3>
                    <p>{error}</p>

                    <button
                      type="button"
                      className="account-primary-button"
                      onClick={refreshOrders}
                    >
                      Try Again
                    </button>
                  </div>
                ) : orders.length > 0 ? (
                  <div className="account-orders-list">
                    {orders.map((order) => {
                      const orderId = getOrderId(order);

                      return (
                        <article
                          className="account-order-card"
                          key={orderId}
                        >
                          <div className="account-order-header">
                            <div>
                              <span>Order Reference</span>
                              <strong>
                                {order.orderNumber || orderId}
                              </strong>
                            </div>

                            <span
                              className={`order-status order-status-${order.status}`}
                            >
                              {getOrderStatusLabel(order.status)}
                            </span>
                          </div>

                          <div className="account-order-meta">
                            <span>
                              {formatOrderDate(order.createdAt)}
                            </span>

                            <span>
                              {(order.items || []).length} product(s)
                            </span>

                            <strong>
                              {formatOrderPrice(order.total)}
                            </strong>
                          </div>

                          <Link
                            to={`/account/orders/${orderId}`}
                            className="account-order-link"
                          >
                            View Order Details
                            <ArrowRight size={16} />
                          </Link>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <div className="account-empty-state">
                    <span className="account-empty-icon">
                      <Package size={32} />
                    </span>

                    <h3>No orders yet</h3>

                    <p>
                      Your purchases will appear here after you
                      successfully place an order.
                    </p>

                    <Link
                      to="/shop"
                      className="account-primary-button"
                    >
                      <ShoppingBag size={17} />
                      Explore Products
                    </Link>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </MainLayout>
  );
};

export default MyOrdersPage;
