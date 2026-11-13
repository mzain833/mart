
const ORDERS_STORAGE_KEY = "nexamart-orders-v1";

const listeners = new Set();

const ORDER_STATUSES = [
  "placed",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const readOrders = () => {
  try {
    const stored = localStorage.getItem(ORDERS_STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

let orders = readOrders();

const notify = () => {
  listeners.forEach((listener) => listener());
};

const commitOrders = (nextOrders) => {
  try {
    localStorage.setItem(
      ORDERS_STORAGE_KEY,
      JSON.stringify(nextOrders)
    );

    orders = nextOrders;
    notify();
  } catch {
    throw new Error("Unable to save order changes.");
  }
};

const normalizeEmail = (email) =>
  String(email || "").trim().toLowerCase();

const generateId = () =>
  globalThis.crypto?.randomUUID?.() ||
  `order-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const generateOrderNumber = () =>
  `NEXA-${Date.now().toString().slice(-8)}-${Math.random()
    .toString(36)
    .slice(2, 5)
    .toUpperCase()}`;

const orderService = {
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getOrdersSnapshot() {
    return orders;
  },

  getOrderById(orderId) {
    return orders.find((order) => order.id === orderId) || null;
  },

  getOrdersByEmail(email) {
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) return [];

    return orders
      .filter(
        (order) =>
          normalizeEmail(order.customer?.email) === normalizedEmail
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );
  },

  async createOrder({
    customer,
    customerId = null,
    items,
    deliveryMethod,
    paymentMethod,
  }) {
    if (!customer?.fullName || !customer?.email || !items?.length) {
      throw new Error("Required order information is missing.");
    }

    const orderItems = items.map(({ product, quantity }) => {
      const price = Number(product?.price);
      const parsedQuantity = Number(quantity);

      if (
        !product?.id ||
        !Number.isFinite(price) ||
        price < 0 ||
        !Number.isInteger(parsedQuantity) ||
        parsedQuantity < 1
      ) {
        throw new Error("Invalid product information in your cart.");
      }

      return {
        product: { ...product },
        quantity: parsedQuantity,
        unitPrice: price,
        lineTotal: price * parsedQuantity,
      };
    });

    const subtotal = orderItems.reduce(
      (total, item) => total + item.lineTotal,
      0
    );

    const now = new Date().toISOString();

    const order = {
      id: generateId(),
      orderNumber: generateOrderNumber(),
      customerId,
      customer: {
        ...customer,
        email: normalizeEmail(customer.email),
      },
      items: orderItems,
      subtotal,
      deliveryFee: null,
      total: subtotal,
      deliveryMethod,
      paymentMethod,
      paymentStatus: "pending",
      status: "placed",
      statusHistory: [
        {
          status: "placed",
          timestamp: now,
          note: "Your order has been successfully placed.",
        },
      ],
      cancellationReason: "",
      createdAt: now,
      updatedAt: now,
    };

    commitOrders([...orders, order]);

    return order;
  },

  updateOrderStatus(orderId, nextStatus, note = "") {
    if (!ORDER_STATUSES.includes(nextStatus)) {
      throw new Error("Invalid order status.");
    }

    const order = orders.find((item) => item.id === orderId);

    if (!order) {
      throw new Error("Order not found.");
    }

    if (order.status === "cancelled" || order.status === "delivered") {
      throw new Error("This order can no longer be updated.");
    }

    const allowedTransitions = {
      placed: ["confirmed", "cancelled"],
      confirmed: ["processing", "cancelled"],
      processing: ["shipped", "cancelled"],
      shipped: ["delivered"],
    };

    if (!allowedTransitions[order.status]?.includes(nextStatus)) {
      throw new Error("This order status transition is not allowed.");
    }

    const now = new Date().toISOString();

    const updatedOrder = {
      ...order,
      status: nextStatus,
      updatedAt: now,
      statusHistory: [
        ...(order.statusHistory || []),
        {
          status: nextStatus,
          timestamp: now,
          note: note.trim(),
        },
      ],
    };

    commitOrders(
      orders.map((item) =>
        item.id === orderId ? updatedOrder : item
      )
    );

    return updatedOrder;
  },

  cancelOrder(orderId, reason) {
    const normalizedReason = String(reason || "").trim();

    if (!normalizedReason) {
      throw new Error("Please provide a cancellation reason.");
    }

    const order = orders.find((item) => item.id === orderId);

    if (!order) {
      throw new Error("Order not found.");
    }

    if (!["placed", "confirmed", "processing"].includes(order.status)) {
      throw new Error("This order is no longer eligible for cancellation.");
    }

    const now = new Date().toISOString();

    const updatedOrder = {
      ...order,
      status: "cancelled",
      cancellationReason: normalizedReason,
      updatedAt: now,
      statusHistory: [
        ...(order.statusHistory || []),
        {
          status: "cancelled",
          timestamp: now,
          note: normalizedReason,
        },
      ],
    };

    commitOrders(
      orders.map((item) =>
        item.id === orderId ? updatedOrder : item
      )
    );

    return updatedOrder;
  },
};

export default orderService;
