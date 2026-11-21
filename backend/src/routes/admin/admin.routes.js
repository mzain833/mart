
import { Router } from "express";

import authenticate from "../../middleware/auth/auth.middleware.js";
import authorizeAdmin from "../../middleware/admin.middleware.js";
import validate from "../../middleware/validate.middleware.js";

import adminController from "../../controllers/admin/admin.controller.js";
import adminOrderController from "../../controllers/admin/admin-order.controller.js";
import adminCustomerController from "../../controllers/admin/admin-customer.controller.js";
import {
  updateAdminOrderStatusSchema,
  cancelAdminOrderSchema,
} from "../../validators/order/admin-order.validator.js";

const router = Router();

router.use(authenticate, authorizeAdmin);

// Dashboard
router.get("/dashboard", adminController.getDashboardStats);

// Product management
router.get("/products", adminController.getAdminProducts);
router.get("/products/:id", adminController.getAdminProductById);
router.patch("/products/:id/activate", adminController.activateProduct);
router.patch("/products/:id/deactivate", adminController.deactivateProduct);

// Order management
router.get("/orders", adminOrderController.getAdminOrders);

router.get(
  "/orders/:orderId",
  adminOrderController.getAdminOrderById
);

router.patch(
  "/orders/:orderId/status",
  validate(updateAdminOrderStatusSchema),
  adminOrderController.updateAdminOrderStatus
);

router.patch(
  "/orders/:orderId/cancel",
  validate(cancelAdminOrderSchema),
  adminOrderController.cancelAdminOrder
);
// Customer management
router.get(
  "/customers",
  adminCustomerController.getAdminCustomers
);

router.get(
  "/customers/:customerId",
  adminCustomerController.getAdminCustomerById
);

router.patch(
  "/customers/:customerId/status",
  adminCustomerController.updateCustomerStatus
);

export default router;
