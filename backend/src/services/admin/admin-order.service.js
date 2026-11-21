
import mongoose from "mongoose";

import Order from "../../models/order/Order.model.js";
import Product from "../../models/product/Product.model.js";
import ApiError from "../../utils/ApiError.js";
import { HTTP_STATUS } from "../../constants/index.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 100;
const MAX_SEARCH_LENGTH = 100;

const ORDER_STATUSES = Object.freeze([
  "placed",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
]);

const PAYMENT_STATUSES = Object.freeze([
  "pending",
  "paid",
  "failed",
  "refunded",
]);

const SORT_OPTIONS = Object.freeze({
  newest: { createdAt: -1, _id: -1 },
  oldest: { createdAt: 1, _id: 1 },
  total_asc: { total: 1, _id: 1 },
  total_desc: { total: -1, _id: -1 },
});

const STATUS_TRANSITIONS = Object.freeze({
  placed: ["confirmed"],
  confirmed: ["processing"],
  processing: ["shipped"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
});

const CANCELLABLE_STATUSES = Object.freeze([
  "placed",
  "confirmed",
  "processing",
]);

const throwBadRequest = (message) => {
  throw new ApiError(HTTP_STATUS.BAD_REQUEST, message);
};

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const validateOrderId = (orderId) => {
  if (!mongoose.isValidObjectId(orderId)) {
    throwBadRequest("Invalid order ID.");
  }
};

const parseInteger = (value, field, min, max) => {
  if (
    typeof value !== "string" ||
    !/^\d+$/.test(value)
  ) {
    throwBadRequest(
      `${field} must be an integer between ${min} and ${max}.`
    );
  }

  const parsed = Number(value);

  if (
    !Number.isSafeInteger(parsed) ||
    parsed < min ||
    parsed > max
  ) {
    throwBadRequest(
      `${field} must be an integer between ${min} and ${max}.`
    );
  }

  return parsed;
};

const parseDateFilter = (value, field, endOfDay = false) => {
  if (typeof value !== "string" || !value.trim()) {
    throwBadRequest(`${field} must be a valid date.`);
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throwBadRequest(`${field} must be a valid date.`);
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    date.setUTCHours(
      endOfDay ? 23 : 0,
      endOfDay ? 59 : 0,
      endOfDay ? 59 : 0,
      endOfDay ? 999 : 0
    );
  }

  return date;
};

const normalizeListQuery = (query = {}) => {
  const allowedFields = new Set([
    "search",
    "status",
    "paymentStatus",
    "paymentMethod",
    "from",
    "to",
    "sort",
    "page",
    "limit",
  ]);

  for (const field of Object.keys(query)) {
    if (!allowedFields.has(field)) {
      throwBadRequest(`Unsupported query parameter: ${field}.`);
    }
  }

  if (
    query.search !== undefined &&
    typeof query.search !== "string"
  ) {
    throwBadRequest("Search must be a valid string.");
  }

  const search = query.search?.trim();

  if (search && search.length > MAX_SEARCH_LENGTH) {
    throwBadRequest("Search query is too long.");
  }

  const status = query.status ?? "all";

  if (
    status !== "all" &&
    !ORDER_STATUSES.includes(status)
  ) {
    throwBadRequest("Invalid order status filter.");
  }

  const paymentStatus = query.paymentStatus ?? "all";

  if (
    paymentStatus !== "all" &&
    !PAYMENT_STATUSES.includes(paymentStatus)
  ) {
    throwBadRequest("Invalid payment status filter.");
  }

  const paymentMethod = query.paymentMethod ?? "all";

  if (
    paymentMethod !== "all" &&
    paymentMethod !== "cod"
  ) {
    throwBadRequest("Invalid payment method filter.");
  }

  const sort = query.sort ?? "newest";

  if (
    typeof sort !== "string" ||
    !Object.hasOwn(SORT_OPTIONS, sort)
  ) {
    throwBadRequest("Invalid order sorting option.");
  }

  const page =
    query.page === undefined
      ? DEFAULT_PAGE
      : parseInteger(query.page, "Page", 1, 1000000);

  const limit =
    query.limit === undefined
      ? DEFAULT_LIMIT
      : parseInteger(query.limit, "Limit", 1, MAX_LIMIT);

  const from =
    query.from === undefined
      ? null
      : parseDateFilter(query.from, "From date");

  const to =
    query.to === undefined
      ? null
      : parseDateFilter(query.to, "To date", true);

  if (from && to && from > to) {
    throwBadRequest("From date cannot be later than to date.");
  }

  return {
    search,
    status,
    paymentStatus,
    paymentMethod,
    from,
    to,
    sort,
    page,
    limit,
  };
};

const getAdminOrders = async (query = {}) => {
  const {
    search,
    status,
    paymentStatus,
    paymentMethod,
    from,
    to,
    sort,
    page,
    limit,
  } = normalizeListQuery(query);

  const filter = {};

  if (status !== "all") {
    filter.status = status;
  }

  if (paymentStatus !== "all") {
    filter.paymentStatus = paymentStatus;
  }

  if (paymentMethod !== "all") {
    filter.paymentMethod = paymentMethod;
  }

  if (search) {
    const regex = new RegExp(escapeRegex(search), "i");

    filter.$or = [
      { orderNumber: regex },
      { "customer.fullName": regex },
      { "customer.email": regex },
      { "customer.phone": regex },
    ];
  }

  if (from || to) {
    filter.createdAt = {};

    if (from) filter.createdAt.$gte = from;
    if (to) filter.createdAt.$lte = to;
  }

  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort(SORT_OPTIONS[sort])
      .skip(skip)
      .limit(limit)
      .lean(),

    Order.countDocuments(filter),
  ]);

  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    },
  };
};

const getAdminOrderById = async (orderId) => {
  validateOrderId(orderId);

  const order = await Order.findById(orderId).lean();

  if (!order) {
    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      "Order not found."
    );
  }

  return order;
};

const updateAdminOrderStatus = async (
  orderId,
  status,
  note = ""
) => {
  validateOrderId(orderId);

  if (!ORDER_STATUSES.includes(status) || status === "cancelled") {
    throwBadRequest("Invalid order status.");
  }

  const normalizedNote = String(note || "").trim();

  if (normalizedNote.length > 500) {
    throwBadRequest("Status note cannot exceed 500 characters.");
  }

  const order = await Order.findById(orderId).select("status");

  if (!order) {
    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      "Order not found."
    );
  }

  const allowedNextStatuses = STATUS_TRANSITIONS[order.status] || [];

  if (!allowedNextStatuses.includes(status)) {
    throw new ApiError(
      HTTP_STATUS.CONFLICT,
      `Order cannot move from ${order.status} to ${status}.`
    );
  }

  const updatedOrder = await Order.findOneAndUpdate(
    {
      _id: orderId,
      status: order.status,
    },
    {
      $set: { status },
      $push: {
        statusHistory: {
          status,
          timestamp: new Date(),
          note: normalizedNote || `Order status updated to ${status}.`,
        },
      },
    },
    {
      new: true,
      runValidators: true,
    }
  ).lean();

  if (!updatedOrder) {
    throw new ApiError(
      HTTP_STATUS.CONFLICT,
      "Order was updated by another request. Please refresh and try again."
    );
  }

  return updatedOrder;
};

const cancelAdminOrder = async (orderId, reason) => {
  validateOrderId(orderId);

  const normalizedReason = String(reason || "").trim();

  if (
    normalizedReason.length < 5 ||
    normalizedReason.length > 500
  ) {
    throwBadRequest(
      "Cancellation reason must contain 5 to 500 characters."
    );
  }

  const session = await mongoose.startSession();

  let cancelledOrder;

  try {
    await session.withTransaction(async () => {
      const order = await Order.findById(orderId).session(session);

      if (!order) {
        throw new ApiError(
          HTTP_STATUS.NOT_FOUND,
          "Order not found."
        );
      }

      if (!CANCELLABLE_STATUSES.includes(order.status)) {
        throw new ApiError(
          HTTP_STATUS.CONFLICT,
          "This order is no longer eligible for cancellation."
        );
      }

      for (const item of order.items) {
        const stockUpdate = await Product.updateOne(
          { _id: item.product.productId },
          { $inc: { stock: item.quantity } },
          { session }
        );

        if (stockUpdate.matchedCount !== 1) {
          throw new ApiError(
            HTTP_STATUS.CONFLICT,
            `Unable to restore inventory for ${item.product.name}.`
          );
        }
      }

      const updatedOrder = await Order.findOneAndUpdate(
        {
          _id: orderId,
          status: order.status,
        },
        {
          $set: {
            status: "cancelled",
            cancellationReason: normalizedReason,
          },
          $push: {
            statusHistory: {
              status: "cancelled",
              timestamp: new Date(),
              note: normalizedReason,
            },
          },
        },
        {
          new: true,
          runValidators: true,
          session,
        }
      );

      if (!updatedOrder) {
        throw new ApiError(
          HTTP_STATUS.CONFLICT,
          "Order status changed. Please refresh and try again."
        );
      }

      cancelledOrder = updatedOrder;
    });
  } finally {
    await session.endSession();
  }

  return cancelledOrder.toObject();
};

const adminOrderService = {
  getAdminOrders,
  getAdminOrderById,
  updateAdminOrderStatus,
  cancelAdminOrder,
};

export default adminOrderService;
