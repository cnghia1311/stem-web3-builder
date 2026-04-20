import jwt from 'jsonwebtoken'
import { StatusCodes } from 'http-status-codes'
import { env } from '../config/environment.js'
import ApiError from '../utils/ApiError.js'

/**
 * Middleware xác thực JWT — verify access token từ header Authorization
 */
const isAuthorized = async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('🔐 [AUTH] No token found in header')
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized! Token not found.'))
    return
  }

  const accessToken = authHeader.split(' ')[1]
  console.log('🔐 [AUTH] Token received:', accessToken.substring(0, 20) + '...')

  try {
    const decoded = jwt.verify(accessToken, env.JWT_SECRET)
    console.log('🔐 [AUTH] Token valid! User:', decoded._id)
    req.jwtDecoded = decoded
    next()
  } catch (error) {
    console.log('🔐 [AUTH] Token error:', error.name, error.message)
    if (error.name === 'TokenExpiredError') {
      console.log('🔐 [AUTH] Expired at:', error.expiredAt)
      next(new ApiError(StatusCodes.GONE, 'Token expired! Please refresh.'))
      return
    }
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
