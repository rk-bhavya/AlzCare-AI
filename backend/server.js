import http from "http";
import mongoose from "mongoose";

import app from "./src/app.js";
import env from "./src/config/env.js";
import connectDB from "./src/config/db.js";

const server = http.createServer(app);

/**
 * Boot sequence: connect to the database FIRST,
 * then start accepting HTTP traffic.
 */
const startServer = async () => {
  try {
    await connectDB();

    server.listen(env.PORT, () => {
      console.log("\n=====================================================");
      console.log("  AI-Based Early Alzheimer's Detection — Backend API");
      console.log("=====================================================");
      console.log(`  🚀 Server      : http://localhost:${env.PORT}`);
      console.log(`  🌍 Environment : ${env.NODE_ENV}`);
      console.log(`  ❤️  Health      : http://localhost:${env.PORT}/api/v1/health`);
      console.log("=====================================================\n");
    });
  } catch (error) {
    console.error(`❌ Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();

/* ------------------------------------------------------------------
   GRACEFUL SHUTDOWN & CRASH SAFETY
------------------------------------------------------------------ */
const shutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(async () => {
    await mongoose.connection.close(false);
    console.log("✅ HTTP server closed and MongoDB connection ended");
    process.exit(0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("unhandledRejection", (reason) => {
  console.error("🔥 UNHANDLED PROMISE REJECTION:", reason);
  server.close(() => process.exit(1));
});

process.on("uncaughtException", (error) => {
  console.error("🔥 UNCAUGHT EXCEPTION:", error);
  process.exit(1);
});
