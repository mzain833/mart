
import { Router } from "express";

import categoryController from "../../controllers/category/category.controller.js";

const router = Router();

router.get("/", categoryController.getPublicCategories);
router.get("/:slug", categoryController.getCategoryBySlug);

export default router;
