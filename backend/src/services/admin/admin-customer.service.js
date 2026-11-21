import mongoose from "mongoose";

import User from "../../models/user/User.model.js";
import Order from "../../models/order/Order.model.js";
import ApiError from "../../utils/ApiError.js";
import { HTTP_STATUS } from "../../constants/index.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 100;
const MAX_SEARCH_LENGTH = 100;
const RECENT_ORDERS_LIMIT = 10;

const SORT_OPTIONS = Object.freeze({
  newest: { createdAt: -1, _id: -1 },
  oldest: { createdAt: 1, _id: 1 },
  name_asc: { fullName: 1, _id: 1 },
  name_desc: { fullName: -1, _id: -1 },
});

const throwBadRequest = (message) => {
  throw new ApiError(HTTP_STATUS.BAD_REQUEST, message);
};

const throwNotFound = (message) => {
  throw new ApiError(HTTP_STATUS.NOT_FOUND, message);
};

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const parseInteger = (value, field, min, max) => {
  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    throwBadRequest(
      `${field} must be an integer between ${min} and ${max}.`
    );
  }

  const parsed = Number(value);

  if (!Number.isSafeInteger(parsed) || parsed < min || parsed > max) {
    throwBadRequest(
      `${field} must be an integer between ${min} and ${max}.`
    );
  }

  return parsed;
};

const normalizeQuery = (query = {}) => {
  const allowedFields = new Set([
    "search",
    "status",
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

  const search = query.search?.trim() || "";

  if (search.length > MAX_SEARCH_LENGTH) {
    throwBadRequest("Search query is too long.");
  }

  const status = query.status ?? "all";

  if (!["all", "active", "inactive"].includes(status)) {
    throwBadRequest("Invalid customer status filter.");
  }

  const sort = query.sort ?? "newest";

  if (
    typeof sort !== "string" ||
    !Object.hasOwn(SORT_OPTIONS, sort)
  ) {
    throwBadRequest("Invalid customer sorting option.");
  }

  const page =
    query.page === undefined
      ? DEFAULT_PAGE
      : parseInteger(query.page, "Page", 1, 1000000);

  const limit =
    query.limit === undefined
      ? DEFAULT_LIMIT
      : parseInteger(query.limit, "Limit", 1, MAX_LIMIT);

  return { search, status, sort, page, limit };
};

const getAdminCustomers = async (query = {}) => {
  const { search, status, sort, page, limit } = normalizeQuery(query);

  const filter = { role: "customer" };

  if (status === "active") filter.isActive = true;
  if (status === "inactive") filter.isActive = false;

  if (search) {
    const searchRegex = new RegExp(escapeRegex(search), "i");

    filter.$or = [
      { fullName: searchRegex },
      { email: searchRegex },
      { phone: searchRegex },
    ];
  }

  const skip = (page - 1) * limit;

  const [customers, total] = await Promise.all([
    User.find(filter)
      .select("_id fullName email phone role isActive createdAt updatedAt")
      .sort(SORT_OPTIONS[sort])
      .skip(skip)
      .limit(limit)
      .lean(),

    User.countDocuments(filter),
  ]);

  const customerIds = customers.map((customer) => customer._id);

  const orderStats = customerIds.length
    ? await Order.aggregate([
        {
          $match: {
            user: { $in: customerIds },
          },
        },
        {
          $group: {
            _id: "$user",
            totalOrders: { $sum: 1 },
            deliveredOrders: {
              $sum: {
                $cond: [{ $eq: ["$status", "delivered"] }, 1, 0],
              },
            },
            totalOrderValue: { $sum: "$total" },
            cancelledOrderValue: {
              $sum: {
                $cond: [
                  { $eq: ["$status", "cancelled"] },
                  "$total",
                  0,
                ],
              },
            },
          },
        },
      ])
    : [];

  const statsMap = new Map(
    orderStats.map((item) => [item._id.toString(), item])
  );

  const result = customers.map((customer) => {
    const stats = statsMap.get(customer._id.toString());

    return {
      ...customer,
      orderStats: {
        totalOrders: stats?.totalOrders ?? 0,
        deliveredOrders: stats?.deliveredOrders ?? 0,
        totalOrderValue: stats?.totalOrderValue ?? 0,
        cancelledOrderValue: stats?.cancelledOrderValue ?? 0,
      },
    };
  });

  return {
    customers: result,
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

const getAdminCustomerById = async (customerId) => {
  if (!mongoose.isValidObjectId(customerId)) {
    throwBadRequest("Invalid customer ID.");
  }

  const customer = await User.findOne({
    _id: customerId,
    role: "customer",
  })
    .select("_id fullName email phone role isActive createdAt updatedAt")
    .lean();

  if (!customer) {
    throwNotFound("Customer not found.");
  }

  const [summaryResult, recentOrders] = await Promise.all([
    Order.aggregate([
      {
        $match: {
          user: customer._id,
        },
      },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          deliveredOrders: {
            $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] },
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
          },
          activeOrders: {
            $sum: {
              $cond: [
                {
                  $in: ["$status", ["placed", "confirmed", "processing", "shipped"]],
                },
                1,
                0,
              ],
            },
          },
          totalOrderValue: { $sum: "$total" },
          cancelledOrderValue: {
            $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, "$total", 0] },
          },
        },
      },
    ]),

    Order.find({ user: customer._id })
      .select(
        "orderNumber status paymentStatus paymentMethod subtotal total items createdAt"
      )
      .sort({ createdAt: -1, _id: -1 })
      .limit(RECENT_ORDERS_LIMIT)
      .lean(),
  ]);

  const summary = summaryResult[0] || {
    totalOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    activeOrders: 0,
    totalOrderValue: 0,
    cancelledOrderValue: 0,
  };

  return {
    customer,
    summary,
    recentOrders,
  };
};

const updateCustomerStatus = async (customerId, isActive) => {
  if (!mongoose.isValidObjectId(customerId)) {
    throwBadRequest("Invalid customer ID.");
  }

  if (typeof isActive !== "boolean") {
    throwBadRequest("Customer status must be a boolean.");
  }

  const customer = await User.findOneAndUpdate(
    {
      _id: customerId,
      role: "customer",
      isActive: !isActive,
    },
    {
      $set: { isActive },
    },
    {
      new: true,
      runValidators: true,
    }
  )
    .select("_id fullName email phone role isActive createdAt updatedAt")
    .lean();

  if (customer) return customer;

  const exists = await User.exists({
    _id: customerId,
    role: "customer",
  });

  if (!exists) {
    throwNotFound("Customer not found.");
  }

  throw new ApiError(
    HTTP_STATUS.CONFLICT,
    `Customer is already ${isActive ? "active" : "inactive"}.`
  );
};

const adminCustomerService = {
  getAdminCustomers,
  getAdminCustomerById,
  updateCustomerStatus,
};

export default adminCustomerService;