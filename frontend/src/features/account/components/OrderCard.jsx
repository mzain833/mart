
import { Package } from "lucide-react";

const formatPrice = (amount) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(amount);

const OrderCard = ({ order }) => {
  return (
    <article className="account-order-card">
      <div className="account-order-icon">
        <Package size={22} />
      </div>

      <div className="account-order-info">
        <strong>{order.orderNumber}</strong>
        <span>
          {new Date(order.createdAt).toLocaleDateString("en-PK")}
        </span>
      </div>

      <div className="account-order-total">
        <strong>{formatPrice(order.subtotal)}</strong>
        <span>{order.status}</span>
      </div>
    </article>
  );
};

export default OrderCard;
