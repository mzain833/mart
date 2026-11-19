
import { Router } from "express";

import productController from "../../controllers/product/product.controller.js";

import validate from "../../middleware/validate.middleware.js";
import authenticate from "../../middleware/auth/auth.middleware.js";
import authorizeAdmin from "../../middleware/admin.middleware.js";
import uploadProductImages from "../../middleware/upload.middleware.js";
import {
  createProductSchema,
  updateProductSchema,
} from "../../validators/product/product.validator.js";

const router = Router();

// Public routes
router.get("/", productController.getProducts);
router.get("/categories", productController.getCategories);
router.get("/:slug", productController.getProductBySlug);

// Admin routes

router.post(
  "/images",
  authenticate,
  authorizeAdmin,
  uploadProductImages,
  productController.uploadProductImages
);



router.post(
  "/",
  authenticate,
  authorizeAdmin,
  validate(createProductSchema),
  productController.createProduct
);

router.patch(
  "/:id",
  authenticate,
  authorizeAdmin,
  validate(updateProductSchema),
  productController.updateProduct
);

router.delete(
  "/:id",
  authenticate,
  authorizeAdmin,
  productController.deleteProduct
);

export default router;
