/**
 * Custom error class carrying an HTTP status code.
 *
 * Anywhere in the app we can now do:
 *   throw new ApiError(404, "Patient not found");
 *
 * The global error handler reads statusCode and message
 * and returns a consistent JSON response.
 */
class ApiError extends Error {
  constructor(statusCode, message = "Something went wrong", errors = []) {
    super(message);

    this.statusCode = statusCode;
    this.success = false;
    this.errors = errors; // array for field-level validation messages
    this.isOperational = true; // distinguishes expected errors from bugs

    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
