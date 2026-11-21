import mongoose from "mongoose";

import Product from "../../models/product/Product.model.js";
import Category from "../../models/category/Category.model.js";
import ApiError from "../../utils/ApiError.js";
import { HTTP_STATUS } from "../../constants/index.js";
import imageService from "./image.service.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 100;
const MAX_SEARCH_LENGTH = 100;

const SORT_OPTIONS = Object.freeze({
  newest: { createdAt: -1, _id: -1 },
  price_asc: { price: 1, _id: 1 },
  price_desc: { price: -1, _id: 1 },
  rating: { rating: -1, _id: -1 },
  popular: { bestSeller: -1, reviewCount: -1, _id: -1 },
});

const throwBadRequest = (message) => {
  throw new ApiError(HTTP_STATUS.BAD_REQUEST, message);
};

const parseInteger = (value, field, { min, max }) => {
  const parsed = Number(value);

  if (!Number.isSafeInteger(parsed) || parsed < min || parsed > max) {
    throwBadRequest(
      `${field} must be an integer between ${min} and ${max}.`
    );
  }

  return parsed;
};

const parsePrice = (value, field) => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0) {
    throwBadRequest(
      `${field} must be a valid non-negative number.`
    );
  }

  return parsed;
};

const parseBoolean = (value, field) => {
  if (value === "true" || value === true) return true;
  if (value === "false" || value === false) return false;

  throwBadRequest(`${field} must be true or false.`);
};

const handleDatabaseError = (error) => {
  if (error?.code === 11000) {
    const duplicateField = Object.keys(error.keyPattern || {})[0];

    const messages = {
      sku: "A product with this SKU already exists.",
      slug: "A product with this slug already exists.",
    };

    throw new ApiError(
      HTTP_STATUS.CONFLICT,
      messages[duplicateField] ||
        "A product with these details already exists."
    );
  }

  throw error;
};

// Resolve a category while preserving legacy string compatibility.
const resolveCategory = async ({ categoryId, category }) => {
  if (categoryId !== undefined) {
    if (!mongoose.isValidObjectId(categoryId)) {
      throwBadRequest("Invalid category ID.");
    }

    const categoryDocument = await Category.findOne({
      _id: categoryId,
      isActive: true,
    }).select("_id name");

    if (!categoryDocument) {
      throw new ApiError(
        HTTP_STATUS.NOT_FOUND,
        "Selected category was not found or is inactive."
      );
    }

    return {
      categoryId: categoryDocument._id,
      category: categoryDocument.name,
    };
  }

  if (category !== undefined) {
    const categoryDocument = await Category.findOne({
      name: category,
      isActive: true,
    }).select("_id name");

    if (categoryDocument) {
      return {
        categoryId: categoryDocument._id,
        category: categoryDocument.name,
      };
    }

    // Existing legacy products and clients remain compatible.
    return {
      category,
      categoryId: null,
    };
  }

  return {};
};

const normalizeProductQuery = (query = {}) => {
  const allowedFields = new Set([
    "search",
    "category",
    "sort",
    "page",
    "limit",
    "isNewArrival",
    "bestSeller",
    "inStock",
    "minPrice",
    "maxPrice",
  ]);

  for (const field of Object.keys(query)) {
    if (!allowedFields.has(field)) {
      throwBadRequest(`Unsupported query parameter: ${field}.`);
    }
  }

  if (query.search !== undefined && typeof query.search !== "string") {
    throwBadRequest("Search must be a valid string.");
  }

  if (query.category !== undefined && typeof query.category !== "string") {
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

  const sort = query.sort || "newest";

  if (
    typeof sort !== "string" ||
    !Object.hasOwn(SORT_OPTIONS, sort)
  ) {
    throwBadRequest("Invalid product sorting option.");
  }

  const page =
    query.page === undefined
      ? DEFAULT_PAGE
      : parseInteger(query.page, "Page", {
          min: 1,
          max: 1000000,
        });

  const limit =
    query.limit === undefined
      ? DEFAULT_LIMIT
      : parseInteger(query.limit, "Limit", {
          min: 1,
          max: MAX_LIMIT,
        });

  const minPrice =
    query.minPrice === undefined
      ? undefined
      : parsePrice(query.minPrice, "Minimum price");

  const maxPrice =
    query.maxPrice === undefined
      ? undefined
      : parsePrice(query.maxPrice, "Maximum price");

  if (
    minPrice !== undefined &&
    maxPrice !== undefined &&
    minPrice > maxPrice
  ) {
    throwBadRequest(
      "Minimum price cannot exceed maximum price."
    );
  }

  return {
    search,
    category,
    sort,
    page,
    limit,
    isNewArrival:
      query.isNewArrival === undefined
        ? undefined
        : parseBoolean(query.isNewArrival, "isNewArrival"),
    bestSeller:
      query.bestSeller === undefined
        ? undefined
        : parseBoolean(query.bestSeller, "bestSeller"),
    inStock:
      query.inStock === undefined
        ? undefined
        : parseBoolean(query.inStock, "inStock"),
    minPrice,
    maxPrice,
  };
};

const getProducts = async (query) => {
  const filters = normalizeProductQuery(query);

  const {
    search,
    category,
    sort,
    page,
    limit,
    isNewArrival,
    bestSeller,
    inStock,
    minPrice,
    maxPrice,
  } = filters;

  const filter = { isActive: true };

  if (search) {
    filter.$text = { $search: search };
  }

  if (category) {
    let categoryDocument = null;

    if (mongoose.isValidObjectId(category)) {
      categoryDocument = await Category.findOne({
        _id: category,
        isActive: true,
      }).select("_id name");
    } else {
      categoryDocument = await Category.findOne({
        slug: category,
        isActive: true,
      }).select("_id name");
    }

    if (categoryDocument) {
      filter.$or = [
        { categoryId: categoryDocument._id },
        {
          category: categoryDocument.name,
          categoryId: null,
        },
      ];
    } else {
      // Backward compatibility for legacy category-name filters.
      filter.category = category;
    }
  }

  if (isNewArrival !== undefined) {
    filter.isNewArrival = isNewArrival;
  }

  if (bestSeller !== undefined) {
    filter.bestSeller = bestSeller;
  }

  if (inStock === true) filter.stock = { $gt: 0 };
  if (inStock === false) filter.stock = 0;

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};

    if (minPrice !== undefined) {
      filter.price.$gte = minPrice;
    }

    if (maxPrice !== undefined) {
      filter.price.$lte = maxPrice;
    }
  }

  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort(SORT_OPTIONS[sort])
      .skip(skip)
      .limit(limit)
      .lean(),

    Product.countDocuments(filter),
  ]);

  return {
    products,
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

const getProductBySlug = async (slug) => {
  const product = await Product.findOne({
    slug,
    isActive: true,
  }).lean();

  if (!product) {
    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      "Product not found."
    );
  }

  return product;
};

const getCategories = async () =>
  Product.distinct("category", { isActive: true });

const createProduct = async (values) => {
  try {
    const categoryValues = await resolveCategory(values);

    return await Product.create({
      ...values,
      ...categoryValues,
    });
  } catch (error) {
    handleDatabaseError(error);
  }
};

const updateProduct = async (productId, values) => {
  if (!mongoose.isValidObjectId(productId)) {
    throwBadRequest("Invalid product ID.");
  }

  const product = await Product.findById(productId);

  if (!product) {
    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      "Product not found."
    );
  }

  const previousImages = (product.images || []).map((image) => ({
    url: image.url,
    publicId: image.publicId,
  }));

  const updatedPrice =
    values.price !== undefined ? values.price : product.price;

  const updatedCompareAtPrice =
    values.compareAtPrice !== undefined
      ? values.compareAtPrice
      : product.compareAtPrice;

  if (
    updatedCompareAtPrice !== null &&
    updatedCompareAtPrice !== undefined &&
    updatedCompareAtPrice <= updatedPrice
  ) {
    throwBadRequest(
      "Compare-at price must be greater than the selling price."
    );
  }

  const updateValues = { ...values };

  if (
    values.categoryId !== undefined ||
    values.category !== undefined
  ) {
    const categoryValues = await resolveCategory(values);
    Object.assign(updateValues, categoryValues);
  }

  if (updateValues.images?.length > 0) {
    updateValues.image = updateValues.images[0].url;
  }

  try {
    Object.assign(product, updateValues);

    await product.save();

    if (values.images !== undefined) {
      const currentPublicIds = new Set(
        (product.images || []).map((image) => image.publicId)
      );

      const removedImages = previousImages.filter(
        (image) => !currentPublicIds.has(image.publicId)
      );

      if (removedImages.length > 0) {
        await imageService.deleteProductImages(removedImages);
      }
    }

    return product;
  } catch (error) {
    handleDatabaseError(error);
  }
};

const deleteProduct = async (productId) => {
  if (!mongoose.isValidObjectId(productId)) {
    throwBadRequest("Invalid product ID.");
  }

  const product = await Product.findOneAndUpdate(
    { _id: productId, isActive: true },
    { $set: { isActive: false } },
    { new: true, runValidators: true }
  );

  if (!product) {
    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      "Product not found."
    );
  }

  return product;
};

const productService = {
  getProducts,
  getProductBySlug,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
};

export default productService;