
import { Router } from "express";

import orderController from "../../controllers/order/order.controller.js";

import authenticate from "../../middleware/auth/auth.middleware.js";
import optionalAuthenticate from "../../middleware/auth/optional-auth.middleware.js";
import validate from "../../middleware/validate.middleware.js";

import {
  createOrderSchema,
  cancelOrderSchema,
  guestOrderConfirmationSchema,
} from "../../validators/order/order.validator.js";

const router = Router();

// Create order: registered customer or guest
router.post(
  "/",
  optionalAuthenticate,
  validate(createOrderSchema),
  orderController.createOrder
);

// Guest order confirmation: secure token required
router.post(
  "/guest/:orderId/confirmation",
  validate(guestOrderConfirmationSchema),
  orderController.getGuestOrderConfirmation
);

// Registered customer's order history
router.get(
  "/my-orders",
  authenticate,
  orderController.getMyOrders
);

// Registered customer's individual order
router.get(
  "/:orderId",
  authenticate,
  orderController.getMyOrderById
);

// Cancel registered customer's order
router.patch(
  "/:orderId/cancel",
  authenticate,
  validate(cancelOrderSchema),
  orderController.cancelOrder
);

export default router;
