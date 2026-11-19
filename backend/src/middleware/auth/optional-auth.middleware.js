
import jwt from "jsonwebtoken";

import User from "../../models/user/User.model.js";
import ApiError from "../../utils/ApiError.js";
import { HTTP_STATUS } from "../../constants/index.js";

const COOKIE_NAME = "nexamart_access_token";

const optionalAuthenticate = async (req, res, next) => {
  try {
    const token = req.cookies?.[COOKIE_NAME];

    if (!token) {
      return next();
    }

    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET,
      {
        issuer: "nexamart-api",
        audience: "nexamart-client",
      }
    );

    const user = await User.findById(payload.sub).select(
      "_id fullName email phone role isActive"
    );

    if (!user || !user.isActive) {
      throw new ApiError(
        HTTP_STATUS.UNAUTHORIZED,
        "Your session is no longer valid."
      );
    }

    req.user = user;

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }

    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return next(
        new ApiError(
          HTTP_STATUS.UNAUTHORIZED,
          "Invalid or expired session."
        )
      );
    }

    next(error);
  }
};

export default optionalAuthenticate;
