
import {
  Check,
  Package,
  ClipboardCheck,
  Truck,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import {
  formatOrderDate,
  getOrderStatusLabel,
} from "../utils/orderUtils";

const statusSteps = [
  { status: "placed", icon: Package },
  { status: "confirmed", icon: ClipboardCheck },
  { status: "processing", icon: Package },
  { status: "shipped", icon: Truck },
  { status: "delivered", icon: CheckCircle2 },
];

const OrderStatusTimeline = ({ order }) => {
  const history = order.statusHistory || [];
  const cancelled = order.status === "cancelled";

  const getHistoryEntry = (status) =>
    history.find((entry) => entry.status === status);

  return (
    <section className="order-timeline">
      <h3>Order Tracking</h3>

      {cancelled ? (
        <div className="order-timeline-cancelled">
          <XCircle size={22} />
          <div>
            <strong>Order Cancelled</strong>
            <p>{order.cancellationReason || "This order was cancelled."}</p>
          </div>
        </div>
      ) : (
        <div className="order-timeline-steps">
          {statusSteps.map((step, index) => {
            const entry = getHistoryEntry(step.status);
            const completed = Boolean(entry);
            const active = order.status === step.status;
            const Icon = step.icon;

            return (
              <div
                className={`order-timeline-step ${
                  completed ? "completed" : ""
                } ${active ? "active" : ""}`}
                key={step.status}
              >
                <div className="order-timeline-marker">
                  {completed ? <Check size={16} /> : <Icon size={17} />}
                </div>

                <div className="order-timeline-content">
                  <strong>{getOrderStatusLabel(step.status)}</strong>

                  {entry && (
                    <>
                      <span>{formatOrderDate(entry.timestamp)}</span>
                      {entry.note && <p>{entry.note}</p>}
                    </>
                  )}
                </div>

                {index !== statusSteps.length - 1 && (
                  <div className="order-timeline-line" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default OrderStatusTimeline;
