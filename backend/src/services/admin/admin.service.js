
import mongoose from "mongoose";

import Order from "../../models/order/Order.model.js";
import Product from "../../models/product/Product.model.js";
import User from "../../models/user/User.model.js";
import ApiError from "../../utils/ApiError.js";
import { HTTP_STATUS } from "../../constants/index.js";

const LOW_STOCK_THRESHOLD = 5;
const RECENT_ORDERS_LIMIT = 5;
const LOW_STOCK_LIMIT = 5;

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 100;
const MAX_SEARCH_LENGTH = 100;

const SORT_OPTIONS = Object.freeze({
  newest: { createdAt: -1, _id: -1 },
  oldest: { createdAt: 1, _id: 1 },
  price_asc: { price: 1, _id: 1 },
  price_desc: { price: -1, _id: -1 },
  name_asc: { name: 1, _id: 1 },
  name_desc: { name: -1, _id: -1 },
});

const throwBadRequest = (message) => {
  throw new ApiError(HTTP_STATUS.BAD_REQUEST, message);
};

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

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

  if (!Number.isSafeInteger(parsed) || parsed < min || parsed > max) {
    throwBadRequest(
      `${field} must be an integer between ${min} and ${max}.`
    );
  }

  return parsed;
};

const normalizeAdminProductQuery = (query = {}) => {
  const allowedFields = new Set([
    "search",
    "category",
    "status",
    "stockStatus",
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

  if (
    query.category !== undefined &&
    typeof query.category !== "string"
  ) {
    throwBadRequest("Category must be a valid string.");
  }

  const search = query.search?.trim();
  const category = query.category?.trim();

  if (search && search.length > MAX_SEARCH_LENGTH) {
    throwBadRequest("Search query is too long.");
  }

  if (query.category !== undefined && !category) {
    throwBadRequest("Category cannot be empty.");
  }

  const status = query.status ?? "all";

  if (!["all", "active", "inactive"].includes(status)) {
    throwBadRequest("Invalid product status filter.");
  }

  const stockStatus = query.stockStatus ?? "all";

  if (
    !["all", "in_stock", "low_stock", "out_of_stock"].includes(
      stockStatus
    )
  ) {
    throwBadRequest("Invalid stock status filter.");
  }

  const sort = query.sort ?? "newest";

  if (
    typeof sort !== "string" ||
    !Object.hasOwn(SORT_OPTIONS, sort)
  ) {
    throwBadRequest("Invalid product sorting option.");
  }

  const page =
    query.page === undefined
      ? DEFAULT_PAGE
      : parseInteger(query.page, "Page", 1, 1000000);

  const limit =
    query.limit === undefined
      ? DEFAULT_LIMIT
      : parseInteger(query.limit, "Limit", 1, MAX_LIMIT);

  return { search, category, status, stockStatus, sort, page, limit };
};

const getDashboardStats = async () => {
  const [
    totalOrders,
    totalProducts,
    totalCustomers,
    activeOrders,
    revenueResult,
    orderValueResult,
    lowStockCount,
    recentOrders,
    lowStockProducts,
  ] = await Promise.all([
    Order.countDocuments(),

    Product.countDocuments({ isActive: true }),

    User.countDocuments({ role: "customer" }),

    Order.countDocuments({
      status: { $in: ["placed", "confirmed", "processing", "shipped"] },
    }),

    Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          status: { $ne: "cancelled" },
        },
      },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),

    Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),

    Product.countDocuments({
      isActive: true,
      stock: { $lte: LOW_STOCK_THRESHOLD },
    }),

    Order.find()
      .select(
        "orderNumber customer.fullName total status paymentStatus createdAt"
      )
      .sort({ createdAt: -1, _id: -1 })
      .limit(RECENT_ORDERS_LIMIT)
      .lean(),

    Product.find({
      isActive: true,
      stock: { $lte: LOW_STOCK_THRESHOLD },
    })
      .select("name sku price stock image category")
      .sort({ stock: 1, _id: 1 })
      .limit(LOW_STOCK_LIMIT)
      .lean(),
  ]);

  return {
    stats: {
      totalRevenue: revenueResult[0]?.total ?? 0,
      totalOrderValue: orderValueResult[0]?.total ?? 0,
      totalOrders,
      activeOrders,
      totalProducts,
      totalCustomers,
      lowStockCount,
    },
    recentOrders,
    lowStockProducts,
  };
};

const getAdminProducts = async (query = {}) => {
  const { search, category, status, stockStatus, sort, page, limit } =
    normalizeAdminProductQuery(query);

  const filter = {};

  if (status === "active") filter.isActive = true;
  if (status === "inactive") filter.isActive = false;

  if (search) {
    const searchRegex = new RegExp(escapeRegex(search), "i");

    filter.$or = [
      { name: searchRegex },
      { sku: searchRegex },
    ];
  }

  if (category) {
    filter.category = category;
  }

  if (stockStatus === "in_stock") {
    filter.stock = { $gt: LOW_STOCK_THRESHOLD };
  }

  if (stockStatus === "low_stock") {
    filter.stock = { $gt: 0, $lte: LOW_STOCK_THRESHOLD };
  }

  if (stockStatus === "out_of_stock") {
    filter.stock = 0;
  }

  const skip = (page - 1) * limit;

  const [products, total, categories] = await Promise.all([
    Product.find(filter)
      .sort(SORT_OPTIONS[sort])
      .skip(skip)
      .limit(limit)
      .lean(),

    Product.countDocuments(filter),

    Product.distinct("category"),
  ]);

  return {
    products,
    categories: categories.sort((a, b) => a.localeCompare(b)),
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

const getAdminProductById = async (productId) => {
  if (!mongoose.isValidObjectId(productId)) {
    throwBadRequest("Invalid product ID.");
  }

  const product = await Product.findById(productId).lean();

  if (!product) {
    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      "Product not found."
    );
  }

  return product;
};

const updateProductStatus = async (productId, isActive) => {
  if (!mongoose.isValidObjectId(productId)) {
    throwBadRequest("Invalid product ID.");
  }

  const product = await Product.findOneAndUpdate(
    { _id: productId, isActive: !isActive },
    { $set: { isActive } },
    { new: true, runValidators: true }
  ).lean();

  if (!product) {
    const exists = await Product.exists({ _id: productId });

    if (!exists) {
      throw new ApiError(
        HTTP_STATUS.NOT_FOUND,
        "Product not found."
      );
    }

    throw new ApiError(
      HTTP_STATUS.CONFLICT,
      `Product is already ${isActive ? "active" : "inactive"}.`
    );
  }

  return product;
};

const activateProduct = (productId) =>
  updateProductStatus(productId, true);

const deactivateProduct = (productId) =>
  updateProductStatus(productId, false);

const adminService = {
  getDashboardStats,
  getAdminProducts,
  getAdminProductById,
  activateProduct,
  deactivateProduct,
};

export default adminService;
