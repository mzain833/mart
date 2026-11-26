
import mongoose from "mongoose";

import Order from "../../models/order/Order.model.js";
import Product from "../../models/product/Product.model.js";
import Category from "../../models/category/Category.model.js";
import User from "../../models/user/User.model.js";
import ApiError from "../../utils/ApiError.js";
import { HTTP_STATUS } from "../../constants/index.js";

const LOW_STOCK_THRESHOLD = 5;
const RECENT_ORDERS_LIMIT = 8;
const LOW_STOCK_LIMIT = 8;

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 100;
const MAX_SEARCH_LENGTH = 100;

const SORT_OPTIONS = Object.freeze({
  newest: { createdAt: -1, _id: -1 },
  oldest: { createdAt: 1, _id: 1 },
  price_asc: { price: 1, _id: 1 },
  price_desc: { price: -1, _id: -1 },
  name_asc: { name: 1, _id: -1 },
  name_desc: { name: -1, _id: 1 },
});

const ACTIVE_ORDER_STATUSES = [
  "placed",
  "confirmed",
  "processing",
  "shipped",
];

const throwBadRequest = (message) => {
  throw new ApiError(HTTP_STATUS.BAD_REQUEST, message);
};

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const parseInteger = (value, field, min, max) => {
  const normalizedValue = String(value);

  if (!/^\d+$/.test(normalizedValue)) {
    throwBadRequest(
      `${field} must be an integer between ${min} and ${max}.`
    );
  }

  const parsed = Number(normalizedValue);

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

  return {
    search,
    category,
    status,
    stockStatus,
    sort,
    page,
    limit,
  };
};

const getDashboardStats = async () => {
  const [
    totalOrders,
    totalProducts,
    totalCustomers,
    activeCustomers,
    inactiveCustomers,
    activeOrders,
    totalCancelledOrders,
    revenueResult,
    orderValueResult,
    cancelledValueResult,
    lowStockCount,
    recentOrders,
    lowStockProducts,
  ] = await Promise.all([
    Order.countDocuments(),

    Product.countDocuments({ isActive: true }),

    User.countDocuments({ role: "customer" }),

    User.countDocuments({
      role: "customer",
      isActive: true,
    }),

    User.countDocuments({
      role: "customer",
      isActive: false,
    }),

    Order.countDocuments({
      status: { $in: ACTIVE_ORDER_STATUSES },
    }),

    Order.countDocuments({ status: "cancelled" }),

    Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          status: { $ne: "cancelled" },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
        },
      },
    ]),

    Order.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
        },
      },
    ]),

    Order.aggregate([
      {
        $match: { status: "cancelled" },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$total" },
        },
      },
    ]),

    Product.countDocuments({
      isActive: true,
      stock: { $lte: LOW_STOCK_THRESHOLD },
    }),

    Order.find()
      .sort({ createdAt: -1 })
      .limit(RECENT_ORDERS_LIMIT)
      .select(
        "orderNumber customer.fullName total status paymentStatus createdAt"
      )
      .lean(),

    Product.find({
      isActive: true,
      stock: { $lte: LOW_STOCK_THRESHOLD },
    })
      .sort({ stock: 1 })
      .limit(LOW_STOCK_LIMIT)
      .select("name sku price stock image category")
      .lean(),
  ]);

  return {
    stats: {
      totalRevenue: revenueResult[0]?.total ?? 0,
      totalOrderValue: orderValueResult[0]?.total ?? 0,
      cancelledOrderValue: cancelledValueResult[0]?.total ?? 0,
      totalOrders,
      totalCancelledOrders,
      activeOrders,
      totalProducts,
      totalCustomers,
      activeCustomers,
      inactiveCustomers,
      lowStockCount,
    },
    recentOrders,
    lowStockProducts,
  };
};

const getAdminProducts = async (query = {}) => {
  const {
    search,
    category,
    status,
    stockStatus,
    sort,
    page,
    limit,
  } = normalizeAdminProductQuery(query);

  const filter = {};

  if (status === "active") {
    filter.isActive = true;
  }

  if (status === "inactive") {
    filter.isActive = false;
  }

  if (search) {
    const searchRegex = new RegExp(escapeRegex(search), "i");

    filter.$or = [
      { name: searchRegex },
      { sku: searchRegex },
    ];
  }

  if (category) {
    const categoryDocument = mongoose.isValidObjectId(category)
      ? await Category.findOne({
          _id: category,
          isActive: true,
        })
          .select("_id name")
          .lean()
      : await Category.findOne({
          isActive: true,
          $or: [
            { slug: category },
            {
              name: {
                $regex: `^${escapeRegex(category)}$`,
                $options: "i",
              },
            },
          ],
        })
          .select("_id name")
          .lean();

    const categoryFilter = categoryDocument
      ? {
          $or: [
            { categoryId: categoryDocument._id },
            {
              category: categoryDocument.name,
              categoryId: null,
            },
            {
              category: categoryDocument.name,
              categoryId: { $exists: false },
            },
          ],
        }
      : { category };

    filter.$and = [
      ...(filter.$and || []),
      categoryFilter,
    ];
  }

  if (stockStatus === "in_stock") {
    filter.stock = { $gt: LOW_STOCK_THRESHOLD };
  }

  if (stockStatus === "low_stock") {
    filter.stock = {
      $gt: 0,
      $lte: LOW_STOCK_THRESHOLD,
    };
  }

  if (stockStatus === "out_of_stock") {
    filter.stock = 0;
  }

  const skip = (page - 1) * limit;

  const [
    products,
    total,
    categoryDocuments,
    legacyCategories,
  ] = await Promise.all([
    Product.find(filter)
      .sort(SORT_OPTIONS[sort])
      .skip(skip)
      .limit(limit)
      .lean(),

    Product.countDocuments(filter),

    Category.find({ isActive: true })
      .select("name")
      .lean(),

    Product.distinct("category"),
  ]);

  const categoryNames = new Map();

  for (const name of [
    ...categoryDocuments.map((item) => item.name),
    ...legacyCategories,
  ]) {
    if (typeof name !== "string" || !name.trim()) {
      continue;
    }

    const normalizedName = name.trim();
    const key = normalizedName.toLocaleLowerCase();

    if (!categoryNames.has(key)) {
      categoryNames.set(key, normalizedName);
    }
  }

  return {
    products,
    categories: [...categoryNames.values()].sort((a, b) =>
      a.localeCompare(b)
    ),
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
    {
      _id: productId,
      isActive: !isActive,
    },
    {
      $set: { isActive },
    },
    {
      new: true,
      runValidators: true,
    }
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
