/**
 * Wraps async controllers so we never write try/catch in every controller.
 * Any rejected promise is forwarded to Express's error handling middleware.
 *
 * Usage:
 *   export const getPatients = asyncHandler(async (req, res) => { ... });
 */
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch(next);
  };
};

export default asyncHandler;
