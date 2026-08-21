import mongoose from "mongoose";
import env from "./env.js";

/**
 * Establishes the MongoDB Atlas connection.
 * Called once from server.js BEFORE the HTTP server starts listening,
 * so the API never accepts requests it cannot serve.
 */
const connectDB = async () => {
  try {
    // Strict query mode: Mongoose will strip fields not in the schema
    mongoose.set("strictQuery", true);

    const connection = await mongoose.connect(env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000, // fail fast if Atlas is unreachable
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected → Host: ${connection.connection.host}`);
    console.log(`✅ Database Name    → ${connection.connection.name}`);

    // Runtime connection event listeners
    mongoose.connection.on("error", (error) => {
      console.error(`❌ MongoDB runtime error: ${error.message}`);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️  MongoDB disconnected");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("🔄 MongoDB reconnected");
    });

    return connection;
  } catch (error) {
    console.error(`\n❌ MongoDB connection failed: ${error.message}`);
    console.error("👉 Check your MONGO_URI, database password and Atlas IP whitelist\n");
    process.exit(1);
  }
};

/**
 * Human readable connection state, used by the health-check endpoint.
 */
export const getDBStatus = () => {
  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };
  return states[mongoose.connection.readyState] || "unknown";
};

export default connectDB;
