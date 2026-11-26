import mongoose from "mongoose";

import ShippingZone from "../../models/shipping/ShippingZone.model.js";
import ApiError from "../../utils/ApiError.js";
import { HTTP_STATUS } from "../../constants/index.js";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 100;

const SHIPPING_FEES = Object.freeze({
  islamabad: 250,
  rawalpindi: 250,
  default: 350,
});

const SORT_OPTIONS = Object.freeze({
  newest: { createdAt: -1, _id: -1 },
  oldest: { createdAt: 1, _id: 1 },
  name_asc: { name: 1 },
  name_desc: { name: -1 },
});

const normalizeLocation = (value) =>
  String(value || "").trim().replace(/\s+/g, " ");

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getLocationFilter = ({ city, province, area }, excludeId = null) => {
  const filter = {
    city: new RegExp(`^${escapeRegex(normalizeLocation(city))}$`, "i"),
    province: new RegExp(
      `^${escapeRegex(normalizeLocation(province))}$`,
      "i"
    ),
    area: new RegExp(`^${escapeRegex(normalizeLocation(area))}$`, "i"),
  };

  if (excludeId) {
    filter._id = { $ne: excludeId };
  }

  return filter;
};

const getDeliveryFee = (city) => {
  const normalizedCity = normalizeLocation(city).toLowerCase();

  return SHIPPING_FEES[normalizedCity] ?? SHIPPING_FEES.default;
};

const validateZoneId = (id) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Invalid shipping zone ID."
    );
  }
};

const findZoneOrFail = async (id) => {
  validateZoneId(id);

  const zone = await ShippingZone.findById(id);

  if (!zone) {
    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      "Shipping zone not found."
    );
  }

  return zone;
};

const ensureUniqueLocation = async (values, excludeId = null) => {
  const existingZone = await ShippingZone.findOne(
    getLocationFilter(values, excludeId)
  ).lean();

  if (existingZone) {
    throw new ApiError(
      HTTP_STATUS.CONFLICT,
      "A shipping zone already exists for this location."
    );
  }
};

const handleDatabaseError = (error) => {
  if (error.code === 11000) {
    throw new ApiError(
      HTTP_STATUS.CONFLICT,
      "A shipping zone already exists for this location."
    );
  }

  throw error;
};

/**
 * Customer quote and order creation must both use this function.
 * Active zone determines coverage; centralized policy determines fee.
 */
const getShippingQuote = async (address, { session } = {}) => {
  const city = normalizeLocation(address?.city);
  const province = normalizeLocation(address?.province);
  const area = normalizeLocation(address?.area);

  if (!city || !province || !area) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "City, province and area are required for delivery."
    );
  }

  let query = ShippingZone.findOne({
    ...getLocationFilter({ city, province, area }),
    isActive: true,
  });

  if (session) {
    query = query.session(session);
  }

  const zone = await query.lean();

  if (!zone) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Delivery is not currently available in this area."
    );
  }

  return {
    zoneId: zone._id,
    zoneName: zone.name,
    city: zone.city,
    province: zone.province,
    area: zone.area,
    deliveryFee: getDeliveryFee(zone.city),
  };
};

const getAdminShippingZones = async (query = {}) => {
  const page = Math.max(
    DEFAULT_PAGE,
    Number.parseInt(query.page, 10) || DEFAULT_PAGE
  );

  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, Number.parseInt(query.limit, 10) || DEFAULT_LIMIT)
  );

  const filter = {};

  if (query.search?.trim()) {
    const search = escapeRegex(query.search.trim().slice(0, 100));

    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { city: { $regex: search, $options: "i" } },
      { province: { $regex: search, $options: "i" } },
      { area: { $regex: search, $options: "i" } },
    ];
  }

  if (query.status === "active") filter.isActive = true;
  if (query.status === "inactive") filter.isActive = false;

  const sort = SORT_OPTIONS[query.sort] || SORT_OPTIONS.newest;
  const skip = (page - 1) * limit;

  const [zones, total] = await Promise.all([
    ShippingZone.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),

    ShippingZone.countDocuments(filter),
  ]);

  return {
    zones,
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

const createShippingZone = async (payload) => {
  const values = {
    ...payload,
    name: normalizeLocation(payload.name),
    city: normalizeLocation(payload.city),
    province: normalizeLocation(payload.province),
    area: normalizeLocation(payload.area),
  };

  // Ignore client/admin fee input and enforce the approved policy.
  values.deliveryFee = getDeliveryFee(values.city);

  await ensureUniqueLocation(values);

  try {
    return await ShippingZone.create(values);
  } catch (error) {
    handleDatabaseError(error);
  }
};

const updateShippingZone = async (id, payload) => {
  const zone = await findZoneOrFail(id);
  const updates = { ...payload };

  for (const field of ["name", "city", "province", "area"]) {
    if (updates[field] !== undefined) {
      updates[field] = normalizeLocation(updates[field]);
    }
  }

  const nextLocation = {
    city: updates.city ?? zone.city,
    province: updates.province ?? zone.province,
    area: updates.area ?? zone.area,
  };

  if (
    updates.city !== undefined ||
    updates.province !== undefined ||
    updates.area !== undefined
  ) {
    await ensureUniqueLocation(nextLocation, zone._id);
  }

  // Keep stored admin data consistent with the central delivery policy.
  updates.deliveryFee = getDeliveryFee(nextLocation.city);

  Object.assign(zone, updates);

  try {
    await zone.save();
    return zone;
  } catch (error) {
    handleDatabaseError(error);
  }
};

const activateShippingZone = async (id) =>
  updateShippingZone(id, { isActive: true });

const deactivateShippingZone = async (id) =>
  updateShippingZone(id, { isActive: false });

const shippingService = {
  getShippingQuote,
  getAdminShippingZones,
  createShippingZone,
  updateShippingZone,
  activateShippingZone,
  deactivateShippingZone,
};

export default shippingService;