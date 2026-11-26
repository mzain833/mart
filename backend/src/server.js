
import "dotenv/config";

import mongoose from "mongoose";

import app from "./app.js";
import connectDatabase from "./config/database.js";

const PORT = Number(process.env.PORT) || 5000;
const SHUTDOWN_TIMEOUT = 10_000;

const startServer = async () => {
  try {
    await connectDatabase();

    const server = app.listen(PORT, () => {
      console.log(`NexaMart API running on port ${PORT}`);
    });

    let isShuttingDown = false;

    const shutdown = (signal) => {
      if (isShuttingDown) return;

      isShuttingDown = true;

      console.log(`${signal} received. Shutting down...`);

      const forceShutdown = setTimeout(() => {
        console.error("Graceful shutdown timed out.");
        process.exit(1);
      }, SHUTDOWN_TIMEOUT);

      forceShutdown.unref();

      server.close(async (error) => {
        try {
          if (error) throw error;

          await mongoose.connection.close();

          clearTimeout(forceShutdown);

          console.log("NexaMart API shut down successfully.");
          process.exit(0);
        } catch (shutdownError) {
          clearTimeout(forceShutdown);

          console.error("Shutdown error:", shutdownError);
          process.exit(1);
        }
      });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();
