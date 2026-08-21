import { getDBStatus } from "../config/db.js";
import env from "../config/env.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * @desc    Server + database health check
 * @route   GET /api/v1/health
 * @access  Public
 */
export const checkHealth = asyncHandler(async (req, res) => {
  const healthData = {
    server: "running",
    database: getDBStatus(),
    environment: env.NODE_ENV,
    uptimeInSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  };

  return res
    .status(200)
    .json(new ApiResponse(200, healthData, "API is healthy and running"));
});
