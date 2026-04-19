/**
 * Custom API Error class — dùng cho error handling tập trung
 * Kế thừa Error để có stack trace
 */
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode

    // Ghi lại stack trace
    Error.captureStackTrace(this, this.constructor)
  }
}

export default ApiError
