
// import { randomBytes, randomUUID, createHash } from "node:crypto";

// import mongoose from "mongoose";

// import Order from "../../models/order/Order.model.js";
// import Product from "../../models/product/Product.model.js";

// import shippingService from "../shipping/shipping.service.js";

// import ApiError from "../../utils/ApiError.js";
// import { HTTP_STATUS } from "../../constants/index.js";

// const MAX_ORDER_QUANTITY = 100;
// const GUEST_TOKEN_BYTES = 32;

// const generateOrderNumber = () =>
//   `NEXA-${Date.now().toString().slice(-8)}-${randomUUID()
//     .replace(/-/g, "")
//     .slice(0, 8)
//     .toUpperCase()}`;

// const generateGuestAccessToken = () =>
//   randomBytes(GUEST_TOKEN_BYTES).toString("hex");

// const hashGuestAccessToken = (token) =>
//   createHash("sha256").update(token).digest("hex");

// const normalizeEmail = (email) =>
//   String(email || "").trim().toLowerCase();

// const sanitizeOrder = (order) => {
//   if (!order) return null;

//   const safeOrder = order.toObject
//     ? order.toObject()
//     : { ...order };

//   delete safeOrder.guestAccessTokenHash;

//   return safeOrder;
// };

// const validateOrderId = (orderId) => {
//   if (!mongoose.isValidObjectId(orderId)) {
//     throw new ApiError(
//       HTTP_STATUS.BAD_REQUEST,
//       "Invalid order ID."
//     );
//   }
// };

// const createOrder = async ({
//   customer,
//   items,
//   deliveryMethod,
//   paymentMethod,
//   userId = null,
// }) => {
//   if (!customer || !Array.isArray(items) || items.length === 0) {
//     throw new ApiError(
//       HTTP_STATUS.BAD_REQUEST,
//       "Required order information is missing."
//     );
//   }

//   if (paymentMethod !== "cod") {
//     throw new ApiError(
//       HTTP_STATUS.BAD_REQUEST,
//       "Currently, only Cash on Delivery is available."
//     );
//   }

//   if (deliveryMethod !== "standard") {
//   throw new ApiError(
//     HTTP_STATUS.BAD_REQUEST,
//     "Currently, only standard delivery is available."
//   );
// }

//   if (items.length > 50) {
//     throw new ApiError(
//       HTTP_STATUS.BAD_REQUEST,
//       "An order cannot contain more than 50 products."
//     );
//   }

//   const normalizedItems = items.map((item) => ({
//     sku: String(item.sku || "").trim().toUpperCase(),
//     quantity: Number(item.quantity),
//   }));

//   const uniqueSkus = new Set(
//     normalizedItems.map((item) => item.sku)
//   );

//   if (
//     uniqueSkus.size !== normalizedItems.length ||
//     normalizedItems.some(
//       (item) =>
//         !item.sku ||
//         !Number.isInteger(item.quantity) ||
//         item.quantity < 1 ||
//         item.quantity > MAX_ORDER_QUANTITY
//     )
//   ) {
//     throw new ApiError(
//       HTTP_STATUS.BAD_REQUEST,
//       "Invalid or duplicate products in your order."
//     );
//   }

//   const guestAccessToken = userId
//     ? null
//     : generateGuestAccessToken();

//   const guestAccessTokenHash = guestAccessToken
//     ? hashGuestAccessToken(guestAccessToken)
//     : null;

//   const session = await mongoose.startSession();

//   let createdOrder;

//   try {
//     await session.withTransaction(async () => {
//       const products = await Product.find({
//         sku: { $in: normalizedItems.map((item) => item.sku) },
//         isActive: true,
//       }).session(session);

//       const shippingQuote = await shippingService.getShippingQuote(
//   {
//     city: customer.city,
//     province: customer.province,
//     area: customer.area,
//   },
//   { session }
// );

//       if (products.length !== normalizedItems.length) {
//         throw new ApiError(
//           HTTP_STATUS.NOT_FOUND,
//           "One or more products are unavailable."
//         );
//       }

//       const productMap = new Map(
//         products.map((product) => [product.sku, product])
//       );

//       const orderItems = [];
//       let subtotal = 0;

//       for (const item of normalizedItems) {
//         const product = productMap.get(item.sku);

//         if (!product) {
//           throw new ApiError(
//             HTTP_STATUS.NOT_FOUND,
//             `Product ${item.sku} was not found.`
//           );
//         }

//         if (product.stock < item.quantity) {
//           throw new ApiError(
//             HTTP_STATUS.CONFLICT,
//             `Insufficient stock for ${product.name}.`
//           );
//         }

//         const unitPrice = Number(product.price);
//         const lineTotal = unitPrice * item.quantity;

//         if (
//           !Number.isFinite(unitPrice) ||
//           unitPrice < 0 ||
//           !Number.isFinite(lineTotal)
//         ) {
//           throw new ApiError(
//             HTTP_STATUS.INTERNAL_SERVER_ERROR,
//             "Invalid product pricing configuration."
//           );
//         }

//         subtotal += lineTotal;

//         orderItems.push({
//           product: {
//             productId: product._id,
//             sku: product.sku,
//             name: product.name,
//             slug: product.slug,
//             image: product.image,
//           },
//           quantity: item.quantity,
//           unitPrice,
//           lineTotal,
//         });
//       }

//       for (const item of normalizedItems) {
//         const product = productMap.get(item.sku);

//         const stockUpdate = await Product.updateOne(
//           {
//             _id: product._id,
//             isActive: true,
//             stock: { $gte: item.quantity },
//           },
//           {
//             $inc: { stock: -item.quantity },
//           },
//           { session }
//         );

//         if (stockUpdate.modifiedCount !== 1) {
//           throw new ApiError(
//             HTTP_STATUS.CONFLICT,
//             `Stock changed for ${product.name}. Please try again.`
//           );
//         }
//       }

//       const orderData = {
//         orderNumber: generateOrderNumber(),
//         user: userId || null,
//         guestAccessTokenHash,
//         customer: {
//           fullName: customer.fullName.trim(),
//           email: normalizeEmail(customer.email),
//           phone: customer.phone.trim(),
//           addressLine1: customer.addressLine1.trim(),
//           addressLine2: customer.addressLine2?.trim() || "",
//           city: customer.city.trim(),
//           province: customer.province.trim(),
//           postalCode: customer.postalCode.trim(),
//         },
//         items: orderItems,
//         subtotal,
//         deliveryFee: null,
//         total: subtotal,
//         deliveryMethod,
//         paymentMethod: "cod",
//         paymentStatus: "pending",
//         status: "placed",
//         statusHistory: [
//           {
//             status: "placed",
//             timestamp: new Date(),
//             note: "Your order has been successfully placed.",
//           },
//         ],
//       };

//       const [order] = await Order.create(
//         [orderData],
//         { session }
//       );

//       createdOrder = order;
//     });
//   } finally {
//     await session.endSession();
//   }

//   return {
//     order: sanitizeOrder(createdOrder),
//     guestAccessToken,
//   };
// };

// const getCustomerOrders = async (userId) => {
//   return Order.find({ user: userId })
//     .sort({ createdAt: -1 })
//     .lean();
// };

// const getCustomerOrderById = async (orderId, userId) => {
//   validateOrderId(orderId);

//   const order = await Order.findOne({
//     _id: orderId,
//     user: userId,
//   }).lean();

//   if (!order) {
//     throw new ApiError(
//       HTTP_STATUS.NOT_FOUND,
//       "Order not found."
//     );
//   }

//   return order;
// };

// const getGuestOrderConfirmation = async (
//   orderId,
//   accessToken
// ) => {
//   validateOrderId(orderId);

//   if (
//     typeof accessToken !== "string" ||
//     !/^[a-f\d]{64}$/i.test(accessToken)
//   ) {
//     throw new ApiError(
//       HTTP_STATUS.UNAUTHORIZED,
//       "Invalid order access credentials."
//     );
//   }

//   const tokenHash = hashGuestAccessToken(accessToken);

//   const order = await Order.findOne({
//     _id: orderId,
//     user: null,
//     guestAccessTokenHash: tokenHash,
//   })
//     .select("+guestAccessTokenHash")
//     .lean();

//   if (!order) {
//     throw new ApiError(
//       HTTP_STATUS.NOT_FOUND,
//       "Order not found or access denied."
//     );
//   }

//   delete order.guestAccessTokenHash;

//   return order;
// };

// const cancelOrder = async (orderId, userId, reason) => {
//   validateOrderId(orderId);

//   const normalizedReason = String(reason || "").trim();

//   if (
//     normalizedReason.length < 5 ||
//     normalizedReason.length > 500
//   ) {
//     throw new ApiError(
//       HTTP_STATUS.BAD_REQUEST,
//       "Cancellation reason must contain 5 to 500 characters."
//     );
//   }

//   const session = await mongoose.startSession();

//   let cancelledOrder;

//   try {
//     await session.withTransaction(async () => {
//       const order = await Order.findOne({
//         _id: orderId,
//         user: userId,
//       }).session(session);

//       if (!order) {
//         throw new ApiError(
//           HTTP_STATUS.NOT_FOUND,
//           "Order not found."
//         );
//       }

//       if (
//         !["placed", "confirmed", "processing"].includes(
//           order.status
//         )
//       ) {
//         throw new ApiError(
//           HTTP_STATUS.BAD_REQUEST,
//           "This order is no longer eligible for cancellation."
//         );
//       }

//       for (const item of order.items) {
//         const stockUpdate = await Product.updateOne(
//           { _id: item.product.productId },
//           { $inc: { stock: item.quantity } },
//           { session }
//         );

//         if (stockUpdate.matchedCount !== 1) {
//           throw new ApiError(
//             HTTP_STATUS.CONFLICT,
//             "Unable to restore product inventory."
//           );
//         }
//       }

//       order.status = "cancelled";
//       order.cancellationReason = normalizedReason;

//       order.statusHistory.push({
//         status: "cancelled",
//         timestamp: new Date(),
//         note: normalizedReason,
//       });

//       await order.save({ session });

//       cancelledOrder = order;
//     });
//   } finally {
//     await session.endSession();
//   }

//   return sanitizeOrder(cancelledOrder);
// };

// const orderService = {
//   createOrder,
//   getCustomerOrders,
//   getCustomerOrderById,
//   getGuestOrderConfirmation,
//   cancelOrder,
// };

// export default orderService;
import { randomBytes, randomUUID, createHash } from "node:crypto";

import mongoose from "mongoose";

import Order from "../../models/order/Order.model.js";
import Product from "../../models/product/Product.model.js";
import shippingService from "../shipping/shipping.service.js";

import ApiError from "../../utils/ApiError.js";
import { HTTP_STATUS } from "../../constants/index.js";

const MAX_ORDER_QUANTITY = 100;
const GUEST_TOKEN_BYTES = 32;

const generateOrderNumber = () =>
  `NEXA-${Date.now().toString().slice(-8)}-${randomUUID()
    .replace(/-/g, "")
    .slice(0, 8)
    .toUpperCase()}`;

const generateGuestAccessToken = () =>
  randomBytes(GUEST_TOKEN_BYTES).toString("hex");

const hashGuestAccessToken = (token) =>
  createHash("sha256").update(token).digest("hex");

const normalizeEmail = (email) =>
  String(email || "").trim().toLowerCase();

const sanitizeOrder = (order) => {
  if (!order) return null;

  const safeOrder = order.toObject
    ? order.toObject()
    : { ...order };

  delete safeOrder.guestAccessTokenHash;

  return safeOrder;
};

const validateOrderId = (orderId) => {
  if (!mongoose.isValidObjectId(orderId)) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Invalid order ID."
    );
  }
};

const createOrder = async ({
  customer,
  items,
  deliveryMethod,
  paymentMethod,
  userId = null,
}) => {
  if (!customer || !Array.isArray(items) || items.length === 0) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Required order information is missing."
    );
  }

  if (paymentMethod !== "cod") {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Currently, only Cash on Delivery is available."
    );
  }

  if (deliveryMethod !== "standard") {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Currently, only standard delivery is available."
    );
  }

  if (items.length > 50) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "An order cannot contain more than 50 products."
    );
  }

  const normalizedItems = items.map((item) => ({
    sku: String(item.sku || "").trim().toUpperCase(),
    quantity: Number(item.quantity),
  }));

  const uniqueSkus = new Set(
    normalizedItems.map((item) => item.sku)
  );

  if (
    uniqueSkus.size !== normalizedItems.length ||
    normalizedItems.some(
      (item) =>
        !item.sku ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > MAX_ORDER_QUANTITY
    )
  ) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Invalid or duplicate products in your order."
    );
  }

  const guestAccessToken = userId
    ? null
    : generateGuestAccessToken();

  const guestAccessTokenHash = guestAccessToken
    ? hashGuestAccessToken(guestAccessToken)
    : null;

  const session = await mongoose.startSession();

  let createdOrder;

  try {
    await session.withTransaction(async () => {
      const shippingQuote = await shippingService.getShippingQuote(
        {
          city: customer.city,
          province: customer.province,
          area: customer.area,
        },
        { session }
      );

      const products = await Product.find({
        sku: { $in: normalizedItems.map((item) => item.sku) },
        isActive: true,
      }).session(session);

      if (products.length !== normalizedItems.length) {
        throw new ApiError(
          HTTP_STATUS.NOT_FOUND,
          "One or more products are unavailable."
        );
      }

      const productMap = new Map(
        products.map((product) => [product.sku, product])
      );

      const orderItems = [];
      let subtotal = 0;

      for (const item of normalizedItems) {
        const product = productMap.get(item.sku);

        if (!product) {
          throw new ApiError(
            HTTP_STATUS.NOT_FOUND,
            `Product ${item.sku} was not found.`
          );
        }

        if (product.stock < item.quantity) {
          throw new ApiError(
            HTTP_STATUS.CONFLICT,
            `Insufficient stock for ${product.name}.`
          );
        }

        const unitPrice = Number(product.price);
        const lineTotal = unitPrice * item.quantity;

        if (
          !Number.isFinite(unitPrice) ||
          unitPrice < 0 ||
          !Number.isFinite(lineTotal)
        ) {
          throw new ApiError(
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
            "Invalid product pricing configuration."
          );
        }

        subtotal += lineTotal;

        orderItems.push({
          product: {
            productId: product._id,
            sku: product.sku,
            name: product.name,
            slug: product.slug,
            image: product.image,
          },
          quantity: item.quantity,
          unitPrice,
          lineTotal,
        });
      }

      for (const item of normalizedItems) {
        const product = productMap.get(item.sku);

        const stockUpdate = await Product.updateOne(
          {
            _id: product._id,
            isActive: true,
            stock: { $gte: item.quantity },
          },
          {
            $inc: { stock: -item.quantity },
          },
          { session }
        );

        if (stockUpdate.modifiedCount !== 1) {
          throw new ApiError(
            HTTP_STATUS.CONFLICT,
            `Stock changed for ${product.name}. Please try again.`
          );
        }
      }

      const orderData = {
        orderNumber: generateOrderNumber(),
        user: userId || null,
        guestAccessTokenHash,
        customer: {
          fullName: customer.fullName.trim(),
          email: normalizeEmail(customer.email),
          phone: customer.phone.trim(),
          addressLine1: customer.addressLine1.trim(),
          addressLine2: customer.addressLine2?.trim() || "",
          city: customer.city.trim(),
          province: customer.province.trim(),
          area: customer.area.trim(),
          postalCode: customer.postalCode.trim(),
        },
        items: orderItems,
        subtotal,
        deliveryFee: shippingQuote.deliveryFee,
        shipping: shippingQuote,
        total: subtotal + shippingQuote.deliveryFee,
        deliveryMethod,
        paymentMethod: "cod",
        paymentStatus: "pending",
        status: "placed",
        statusHistory: [
          {
            status: "placed",
            timestamp: new Date(),
            note: "Your order has been successfully placed.",
          },
        ],
      };

      const [order] = await Order.create(
        [orderData],
        { session }
      );

      createdOrder = order;
    });
  } finally {
    await session.endSession();
  }

  return {
    order: sanitizeOrder(createdOrder),
    guestAccessToken,
  };
};

const getCustomerOrders = async (userId) => {
  return Order.find({ user: userId })
    .sort({ createdAt: -1 })
    .lean();
};

const getCustomerOrderById = async (orderId, userId) => {
  validateOrderId(orderId);

  const order = await Order.findOne({
    _id: orderId,
    user: userId,
  }).lean();

  if (!order) {
    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      "Order not found."
    );
  }

  return order;
};

const getGuestOrderConfirmation = async (
  orderId,
  accessToken
) => {
  validateOrderId(orderId);

  if (
    typeof accessToken !== "string" ||
    !/^[a-f\d]{64}$/i.test(accessToken)
  ) {
    throw new ApiError(
      HTTP_STATUS.UNAUTHORIZED,
      "Invalid order access credentials."
    );
  }

  const tokenHash = hashGuestAccessToken(accessToken);

  const order = await Order.findOne({
    _id: orderId,
    user: null,
    guestAccessTokenHash: tokenHash,
  })
    .select("+guestAccessTokenHash")
    .lean();

  if (!order) {
    throw new ApiError(
      HTTP_STATUS.NOT_FOUND,
      "Order not found or access denied."
    );
  }

  delete order.guestAccessTokenHash;

  return order;
};

const cancelOrder = async (orderId, userId, reason) => {
  validateOrderId(orderId);

  const normalizedReason = String(reason || "").trim();

  if (
    normalizedReason.length < 5 ||
    normalizedReason.length > 500
  ) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      "Cancellation reason must contain 5 to 500 characters."
    );
  }

  const session = await mongoose.startSession();

  let cancelledOrder;

  try {
    await session.withTransaction(async () => {
      const order = await Order.findOne({
        _id: orderId,
        user: userId,
      }).session(session);

      if (!order) {
        throw new ApiError(
          HTTP_STATUS.NOT_FOUND,
          "Order not found."
        );
      }

      if (
        !["placed", "confirmed", "processing"].includes(
          order.status
        )
      ) {
        throw new ApiError(
          HTTP_STATUS.BAD_REQUEST,
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
            "Unable to restore product inventory."
          );
        }
      }

      order.status = "cancelled";
      order.cancellationReason = normalizedReason;

      order.statusHistory.push({
        status: "cancelled",
        timestamp: new Date(),
        note: normalizedReason,
      });

      await order.save({ session });

      cancelledOrder = order;
    });
  } finally {
    await session.endSession();
  }

  return sanitizeOrder(cancelledOrder);
};

const orderService = {
  createOrder,
  getCustomerOrders,
  getCustomerOrderById,
  getGuestOrderConfirmation,
  cancelOrder,
};

export default orderService;