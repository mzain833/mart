
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth/auth.routes.js";
import orderRoutes from "./routes/order/order.routes.js";
import productRoutes from "./routes/product/product.routes.js";
import adminRoutes from "./routes/admin/admin.routes.js";

import notFoundMiddleware from "./middleware/not-found.middleware.js";
import errorMiddleware from "./middleware/error.middleware.js";
import categoryRoutes from "./routes/category/category.routes.js";
import adminCategoryRoutes from "./routes/category/category.admin.routes.js";
const app = express();

// Security
app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// Request parsing
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

// API rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

app.use("/api", apiLimiter);

// Health check
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "NexaMart API is operational.",
    environment: process.env.NODE_ENV || "development",
  });
});

// API routes
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/admin/categories", adminCategoryRoutes);

// Error handling
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
