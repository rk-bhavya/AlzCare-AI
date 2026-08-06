/**
 * Standard success response wrapper.
 * Every endpoint returns the same JSON shape, which makes the
 * React side predictable: response.data.success / .message / .data
 */
class ApiResponse {
  constructor(statusCode = 200, data = null, message = "Success") {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}

export default ApiResponse;
