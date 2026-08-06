import ApiError from "../utils/ApiError.js";

/**
 * Catches any request that did not match a registered route
 * and converts it into a 404 ApiError, so unknown URLs still
 * return clean JSON instead of Express's default HTML page.
 */
const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

export default notFound;
