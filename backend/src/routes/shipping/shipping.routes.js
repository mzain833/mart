
import { Router } from "express";

import shippingController from "../../controllers/shipping/shipping.controller.js";

import authenticate from "../../middleware/auth/auth.middleware.js";
import authorizeAdmin from "../../middleware/admin.middleware.js";
import validate from "../../middleware/validate.middleware.js";

import {
  createShippingZoneSchema,
  updateShippingZoneSchema,
} from "../../validators/shipping/shipping.validator.js";

const router = Router();

router.use(authenticate, authorizeAdmin);

router.get("/", shippingController.getAdminShippingZones);

router.post(
  "/",
  validate(createShippingZoneSchema),
  shippingController.createShippingZone
);

router.patch(
  "/:id",
  validate(updateShippingZoneSchema),
  shippingController.updateShippingZone
);

router.patch(
  "/:id/activate",
  shippingController.activateShippingZone
);

router.patch(
  "/:id/deactivate",
  shippingController.deactivateShippingZone
);

export default router;
