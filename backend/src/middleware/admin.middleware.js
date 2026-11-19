
import ApiError from "../utils/ApiError.js";
import { HTTP_STATUS } from "../constants/index.js";

const authorizeAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return next(
      new ApiError(
        HTTP_STATUS.FORBIDDEN,
        "You do not have permission to perform this action."
      )
    );
  }

  return next();
};

export default authorizeAdmin;
