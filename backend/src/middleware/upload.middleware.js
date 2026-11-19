
import multer from "multer";

import ApiError from "../utils/ApiError.js";
import { HTTP_STATUS } from "../constants/index.js";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_FILES = 8;

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES,
  },

  fileFilter: (req, file, callback) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return callback(
        new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          "Only JPG, PNG, WEBP and AVIF images are allowed."
        )
      );
    }

    callback(null, true);
  },
});

const uploadProductImages = (req, res, next) => {
  upload.array("images", MAX_FILES)(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error instanceof multer.MulterError) {
      const message =
        error.code === "LIMIT_FILE_SIZE"
          ? "Each image must be 5 MB or smaller."
          : error.code === "LIMIT_FILE_COUNT"
            ? `You can upload a maximum of ${MAX_FILES} images.`
            : "Invalid image upload request.";

      return next(
        new ApiError(HTTP_STATUS.BAD_REQUEST, message)
      );
    }

    next(error);
  });
};

export default uploadProductImages;
