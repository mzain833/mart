
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

const OrderConfirmationPage = () => {
  const { orderId } = useParams();

  const order = orderService.getOrderById(orderId);

  return (
    <MainLayout>
      <main className="confirmation-page">
        <div className="confirmation-container">
          {!order ? (
            <div className="confirmation-card">
              <PackageCheck size={48} />
              <h1>Order Details Unavailable</h1>
              <p>
                This order could not be found. Please check your
                order history or continue shopping.
              </p>
              <Link to="/shop" className="confirmation-button">
                Continue Shopping
              </Link>
            </div>
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
                <strong>{order.orderNumber}</strong>
              </div>

              <div className="confirmation-details">
                <div>
                  <span>Customer</span>
                  <strong>{order.customer.fullName}</strong>
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

              <div className="confirmation-order-items">
                <h3>Ordered Products</h3>

                {order.items.map((item, index) => (
                  <div
                    className="confirmation-item"
                    key={`${item.product.id}-${index}`}
                  >
                    <span>
                      {item.product.name} × {item.quantity}
                    </span>

                    <strong>
                      {formatOrderPrice(item.lineTotal)}
                    </strong>
                  </div>
                ))}
              </div>

              <div className="confirmation-order-total">
                <span>Product Total</span>
                <strong>
                  {formatOrderPrice(order.total)}
                </strong>
              </div>

              <p className="confirmation-note">
                Delivery charges will be confirmed before dispatch.
                This order is currently stored in frontend demo
                storage. Online payment processing and live delivery
                updates require backend integration.
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
