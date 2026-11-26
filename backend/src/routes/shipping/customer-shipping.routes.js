import { Router } from "express";

import customerShippingController from "../../controllers/shipping/customer-shipping.controller.js";
import validate from "../../middleware/validate.middleware.js";
import { shippingQuoteSchema } from "../../validators/shipping/customer-shipping.validator.js";

const router = Router();

router.post(
  "/quote",
  validate(shippingQuoteSchema),
  customerShippingController.getShippingQuote
);

export default router;