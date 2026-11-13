
import ApiError from "../utils/ApiError.js";
import { HTTP_STATUS } from "../constants/index.js";

const notFoundMiddleware = (req, res, next) => {
  next(
    new ApiError(
      HTTP_STATUS.NOT_FOUND,
      `Route not found: ${req.method} ${req.originalUrl}`
    )
  );
};

export default notFoundMiddleware;
