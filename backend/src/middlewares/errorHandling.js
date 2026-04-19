import { StatusCodes } from 'http-status-codes'
import { env } from '../config/environment.js'

/**
 * Middleware xử lý lỗi tập trung — luôn đặt cuối cùng trong app
 */
// eslint-disable-next-line no-unused-vars
export const errorHandlingMiddleware = (err, req, res, next) => {
  // Nếu dev, log chi tiết ra console
  if (env.BUILD_MODE === 'dev') {
    console.error('❌ Error:', err)
  }

  // Mặc định là 500 Internal Server Error
  const responseError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    message: err.message || StatusCodes[StatusCodes.INTERNAL_SERVER_ERROR],
    stack: env.BUILD_MODE === 'dev' ? err.stack : undefined
  }

  res.status(responseError.statusCode).json(responseError)
}
