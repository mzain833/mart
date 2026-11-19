
import { Router } from "express";

import authController from "../../controllers/auth/auth.controller.js";
import userController from "../../controllers/auth/user.controller.js";

import validate from "../../middleware/validate.middleware.js";
import authenticate from "../../middleware/auth/auth.middleware.js";

import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
} from "../../validators/auth/auth.validator.js";

const router = Router();

router.post(
  "/register",
  validate(registerSchema),
  authController.register
);

router.post(
  "/login",
  validate(loginSchema),
  authController.login
);

router.post(
  "/logout",
  authController.logout
);

router.get(
  "/me",
  authenticate,
  userController.getCurrentUser
);

router.patch(
  "/profile",
  authenticate,
  validate(updateProfileSchema),
  userController.updateCurrentUser
);

export default router;
