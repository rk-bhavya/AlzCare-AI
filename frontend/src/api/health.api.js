import axiosInstance from "./axiosInstance.js";

/**
 * GET /api/v1/health
 * Returns { server, database, environment, uptimeInSeconds, timestamp }
 */
export const getServerHealth = async () => {
  const response = await axiosInstance.get("/health");
  return response.data.data;
};
