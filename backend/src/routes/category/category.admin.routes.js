
import { Router } from "express";

import authenticate from "../../middleware/auth/auth.middleware.js";
import authorizeAdmin from "../../middleware/admin.middleware.js";
import validate from "../../middleware/validate.middleware.js";

import categoryController from "../../controllers/category/category.controller.js";

import {
  createCategorySchema,
  updateCategorySchema,
} from "../../validators/category/category.validator.js";

const router = Router();

router.use(authenticate, authorizeAdmin);

router.get("/", categoryController.getAdminCategories);

router.post(
  "/",
  validate(createCategorySchema),
  categoryController.createCategory
);

router.patch(
  "/:id",
  validate(updateCategorySchema),
  categoryController.updateCategory
);

router.patch("/:id/activate", categoryController.activateCategory);
router.patch("/:id/deactivate", categoryController.deactivateCategory);

export default router;
