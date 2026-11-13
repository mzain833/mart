
import { Link } from "react-router-dom";
import { Package, ShoppingBag, ArrowRight } from "lucide-react";

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

const MyOrdersPage = () => {
  const { currentUser } = useAccount();

  const { orders } = useOrders(currentUser?.email);

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
                    {orders.length
                      ? `${orders.length} order(s) found.`
                      : "Your recent purchases will appear here."}
                  </p>
                </div>

                {orders.length > 0 ? (
                  <div className="account-orders-list">
                    {orders.map((order) => (
                      <article
                        className="account-order-card"
                        key={order.id}
                      >
                        <div className="account-order-header">
                          <div>
                            <span>Order Reference</span>
                            <strong>{order.orderNumber}</strong>
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
                            {order.items.length} product(s)
                          </span>

                          <strong>
                            {formatOrderPrice(order.total)}
                          </strong>
                        </div>

                        <Link
                          to={`/account/orders/${order.id}`}
                          className="account-order-link"
                        >
                          View Order Details
                          <ArrowRight size={16} />
                        </Link>
                      </article>
                    ))}
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
