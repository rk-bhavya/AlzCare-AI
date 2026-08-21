import mongoose from "mongoose";
import env from "../config/env.js";
import ApiError from "../utils/ApiError.js";

/**
 * GLOBAL ERROR HANDLER — must be the LAST middleware registered in app.js.
 * Express identifies it as an error handler because it has 4 parameters.
 *
 * It normalises every error type (Mongoose, JWT, Multer, custom) into
 * one consistent JSON response.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let error = err;

  // ---- Mongoose: invalid ObjectId (e.g. /api/v1/patients/abc) ----
  if (error instanceof mongoose.Error.CastError) {
    error = new ApiError(400, `Invalid ${error.path}: ${error.value}`);
  }

  // ---- Mongoose: schema validation failure ----
  else if (error instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(error.errors).map((item) => item.message);
    error = new ApiError(400, "Validation failed", messages);
  }

  // ---- MongoDB: duplicate key (unique index violation) ----
  else if (error.code === 11000) {
    const field = Object.keys(error.keyValue || {})[0] || "field";
    error = new ApiError(409, `${field} already exists. Please use another ${field}.`);
  }

  // ---- JWT errors (used from Feature 2 onwards) ----
  else if (error.name === "JsonWebTokenError") {
    error = new ApiError(401, "Invalid access token");
  } else if (error.name === "TokenExpiredError") {
    error = new ApiError(401, "Access token expired. Please login again.");
  }

  // ---- Malformed JSON body ----
  else if (error.type === "entity.parse.failed") {
    error = new ApiError(400, "Invalid JSON payload in request body");
  }

  // ---- Anything else that is not already an ApiError ----
  else if (!(error instanceof ApiError)) {
    error = new ApiError(
      error.statusCode || 500,
      error.message || "Internal Server Error"
    );
  }

  // Log server-side faults with full stack for debugging
  if (error.statusCode >= 500) {
    console.error("🔥 SERVER ERROR:", err);
  }

  const response = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    errors: error.errors?.length ? error.errors : undefined,
    // Stack traces are exposed in development ONLY
    stack: env.isDevelopment ? err.stack : undefined,
  };

  return res.status(error.statusCode).json(response);
};

export default errorHandler;
