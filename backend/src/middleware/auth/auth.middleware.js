
import jwt from "jsonwebtoken";

import User from "../../models/user/User.model.js";
import ApiError from "../../utils/ApiError.js";
import { HTTP_STATUS } from "../../constants/index.js";

const COOKIE_NAME = "nexamart_access_token";

const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies?.[COOKIE_NAME];

    if (!token) {
      throw new ApiError(
        HTTP_STATUS.UNAUTHORIZED,
        "Authentication required. Please sign in."
      );
    }

    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET,
      {
        issuer: "nexamart-api",
        audience: "nexamart-client",
      }
    );

    if (!payload.sub) {
      throw new ApiError(
        HTTP_STATUS.UNAUTHORIZED,
        "Invalid authentication session."
      );
    }

    const user = await User.findById(payload.sub).select(
      "_id fullName email phone role isActive createdAt updatedAt"
    );

    if (!user || !user.isActive) {
      throw new ApiError(
        HTTP_STATUS.UNAUTHORIZED,
        "Your session is no longer valid."
      );
    }

    req.user = user;

    return next();
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }

    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError" ||
      error.name === "NotBeforeError"
    ) {
      return next(
        new ApiError(
          HTTP_STATUS.UNAUTHORIZED,
          "Invalid or expired session."
        )
      );
    }

    return next(error);
  }
};

export default authenticate;
