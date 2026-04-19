import jwt from 'jsonwebtoken'
import { StatusCodes } from 'http-status-codes'
import { env } from '../config/environment.js'
import ApiError from '../utils/ApiError.js'

/**
 * Middleware xác thực JWT — verify access token từ header Authorization
 */
const isAuthorized = async (req, res, next) => {
  // Lấy access token từ header Authorization
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized! Token not found.'))
    return
  }

  const accessToken = authHeader.split(' ')[1]

  try {
    // Verify token
    const decoded = jwt.verify(accessToken, env.JWT_SECRET)

    // Gán thông tin user vào request để dùng ở controller/service
    req.jwtDecoded = decoded

    next()
  } catch (error) {
    // Token hết hạn → frontend cần gọi refresh token
    if (error.name === 'TokenExpiredError') {
      next(new ApiError(StatusCodes.GONE, 'Token expired! Please refresh.'))
      return
    }

    // Token không hợp lệ
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized! Invalid token.'))
  }
}

/**
 * Middleware optional — parse JWT nếu có, nhưng không chặn nếu không có
 * Dùng cho route vừa public vừa muốn biết ai gọi (VD: export/save)
 */
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Không có token → vẫn cho đi tiếp, nhưng không có user info
    req.jwtDecoded = null
    return next()
  }

  const accessToken = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(accessToken, env.JWT_SECRET)
    req.jwtDecoded = decoded
  } catch (error) {
    // Token lỗi → coi như không đăng nhập
    req.jwtDecoded = null
  }

  next()
}

export const authMiddleware = {
  isAuthorized,
  optionalAuth
}
