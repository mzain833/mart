import mongoose from "mongoose";

import Category from "../../models/category/Category.model.js";
import Product from "../../models/product/Product.model.js";
import ApiError from "../../utils/ApiError.js";
import { HTTP_STATUS } from "../../constants/index.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 100;

const SORT_OPTIONS = Object.freeze({
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  name_asc: { name: 1 },
  name_desc: { name: -1 },
});

const createSlug = (value) =>
  value
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const parsePagination = (query = {}) => {
  const page = Math.max(
    DEFAULT_PAGE,
    Number.parseInt(query.page, 10) || DEFAULT_PAGE
  );

  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, Number.parseInt(query.limit, 10) || DEFAULT_LIMIT)
  );

  return { page, limit, skip: (page - 1) * limit };
};

const generateUniqueSlug = async (value, excludeId = null) => {
  const baseSlug = createSlug(value);

  if (!baseSlug) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "A valid category name is required."
    );
  }

  let slug = baseSlug;
  let counter = 1;

  while (
    await Category.exists({
      slug,
      ...(excludeId && { _id: { $ne: excludeId } }),
    })
  ) {
    counter += 1;
    slug = `${baseSlug}-${counter}`;
  }

  return slug;
};

const handleDuplicateError = (error) => {
  if (error?.code === 11000) {
    throw new ApiError(
      HTTP_STATUS.CONFLICT,
      "A category with this slug already exists."
    );
  }

  throw error;
};

const getPublicCategories = async () =>
  Category.find({ isActive: true })
    .select("name slug description image")
    .sort({ name: 1 })
    .lean();

const getCategoryBySlug = async (slug) => {
  const category = await Category.findOne({
    slug,
    isActive: true,
  }).lean();

  if (!category) {
    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      "Category not found."
    );
  }

  return category;
};

const getAdminCategories = async (query = {}) => {
  const { page, limit, skip } = parsePagination(query);

  const filter = {};

  if (query.search?.trim()) {
    const search = escapeRegex(query.search.trim().slice(0, 80));

    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { slug: { $regex: search, $options: "i" } },
    ];
  }

  if (query.status === "active") {
    filter.isActive = true;
  } else if (query.status === "inactive") {
    filter.isActive = false;
  }

  const sort = SORT_OPTIONS[query.sort] || SORT_OPTIONS.newest;

  const [categories, total] = await Promise.all([
    Category.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),

    Category.countDocuments(filter),
  ]);

  return {
    categories,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
    },
  };
};

const createCategory = async (payload) => {
  try {
    const slug = payload.slug
      ? createSlug(payload.slug)
      : await generateUniqueSlug(payload.name);

    if (!slug) {
      throw new ApiError(
        HTTP_STATUS.BAD_REQUEST,
        "A valid category slug is required."
      );
    }

    return await Category.create({
      ...payload,
      slug,
    });
  } catch (error) {
    handleDuplicateError(error);
  }
};

const updateCategory = async (categoryId, payload) => {
  if (!mongoose.isValidObjectId(categoryId)) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Invalid category ID."
    );
  }

  const category = await Category.findById(categoryId);

  if (!category) {
    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      "Category not found."
    );
  }

  if (payload.isActive === false && category.isActive) {
    const assignedProducts = await Product.countDocuments({
      isActive: true,
      $or: [
        { categoryId: category._id },
        { category: category.name },
      ],
    });

    if (assignedProducts > 0) {
      throw new ApiError(
        HTTP_STATUS.CONFLICT,
        "This category has active products. Reassign those products before deactivating it."
      );
    }
  }

  const previousName = category.name;

  try {
    if (payload.name && payload.name !== category.name) {
      category.name = payload.name;

      category.slug =
        payload.slug || (await generateUniqueSlug(payload.name, categoryId));
    } else if (payload.slug) {
      category.slug = createSlug(payload.slug);
    }

    if (payload.description !== undefined) {
      category.description = payload.description;
    }

    if (payload.image !== undefined) {
      category.image = payload.image;
    }

    if (payload.isActive !== undefined) {
      category.isActive = payload.isActive;
    }

    await category.save();

    if (previousName !== category.name) {
      await Product.updateMany(
        {
          $or: [
            { categoryId: category._id },
            { category: previousName },
          ],
        },
        { $set: { category: category.name } }
      );
    }

    return category;
  } catch (error) {
    handleDuplicateError(error);
  }
};

const deactivateCategory = async (categoryId) =>
  updateCategory(categoryId, { isActive: false });

const activateCategory = async (categoryId) =>
  updateCategory(categoryId, { isActive: true });

const categoryService = {
  getPublicCategories,
  getCategoryBySlug,
  getAdminCategories,
  createCategory,
  updateCategory,
  deactivateCategory,
  activateCategory,
};

export default categoryService;