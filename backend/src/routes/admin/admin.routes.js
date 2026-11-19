
import { Router } from "express";

import authenticate from "../../middleware/auth/auth.middleware.js";
import authorizeAdmin from "../../middleware/admin.middleware.js";
import adminController from "../../controllers/admin/admin.controller.js";

const router = Router();

router.use(authenticate, authorizeAdmin);

router.get("/dashboard", adminController.getDashboardStats);

router.get("/products", adminController.getAdminProducts);

router.get("/products/:id", adminController.getAdminProductById);

router.patch("/products/:id/activate", adminController.activateProduct);

router.patch("/products/:id/deactivate", adminController.deactivateProduct);

export default router;
