import { WHITELIST_DOMAINS } from '../utils/constants.js'
import { env } from './environment.js'
import { StatusCodes } from 'http-status-codes'
import ApiError from '../utils/ApiError.js'

export const corsOptions = {
  origin: function (origin, callback) {
    // Cho phép khi không có origin (Postman, mobile, server-to-server)
    if (!origin) {
      return callback(null, true)
    }

    // Dev mode: cho phép localhost
    if (env.BUILD_MODE === 'dev') {
      return callback(null, true)
    }

    // Production: kiểm tra whitelist
    if (WHITELIST_DOMAINS.includes(origin)) {
      return callback(null, true)
    }

    return callback(new ApiError(StatusCodes.FORBIDDEN, `${origin} not allowed by CORS`))
  },

  // Cần thiết cho cookie (refresh token)
  credentials: true,

  optionsSuccessStatus: 200
}
