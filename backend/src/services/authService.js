import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { StatusCodes } from 'http-status-codes'
import { userModel } from '../models/userModel.js'
import { env } from '../config/environment.js'
import ApiError from '../utils/ApiError.js'

/**
 * Tạo cặp access token + refresh token
 */
const generateTokens = (userInfo) => {
  const accessToken = jwt.sign(
    { _id: userInfo._id, email: userInfo.email, role: userInfo.role, displayName: userInfo.displayName },
    env.JWT_SECRET,
    { expiresIn: '1h' }
  )

  const refreshToken = jwt.sign(
    { _id: userInfo._id, email: userInfo.email },
    env.JWT_REFRESH_SECRET,
    { expiresIn: '14d' }
  )

  return { accessToken, refreshToken }
}

/**
 * Đăng ký tài khoản mới
 */
const register = async (reqBody) => {
  // Kiểm tra email đã tồn tại chưa
  const existingUser = await userModel.findOneByEmail(reqBody.email)
  if (existingUser) {
    throw new ApiError(StatusCodes.CONFLICT, 'Email đã được sử dụng!')
  }

  // Kiểm tra tên hiển thị đã tồn tại chưa
  const existingName = await userModel.findOneByDisplayName(reqBody.displayName)
  if (existingName) {
    throw new ApiError(StatusCodes.CONFLICT, 'Tên hiển thị đã có người sử dụng!')
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(reqBody.password, 10)

  // Tạo user mới
  const newUser = {
    email: reqBody.email.toLowerCase(),
    password: hashedPassword,
    displayName: reqBody.displayName
  }

  const createdUser = await userModel.createNew(newUser)
  const user = await userModel.findOneById(createdUser.insertedId.toString())

  // Tạo tokens
  const tokens = generateTokens(user)

  // Trả về user info (không trả password)
  return {
    ...tokens,
    user: {
      _id: user._id,
      email: user.email,
      displayName: user.displayName,
      avatar: user.avatar,
      role: user.role
    }
  }
}

/**
 * Đăng nhập
 */
const login = async (reqBody) => {
  const user = await userModel.findOneByEmail(reqBody.email)
  if (!user) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Email hoặc mật khẩu không đúng!')
  }

  // So sánh password
  const isMatch = await bcrypt.compare(reqBody.password, user.password)
  if (!isMatch) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Email hoặc mật khẩu không đúng!')
  }

  // Tạo tokens
  const tokens = generateTokens(user)

  return {
    ...tokens,
    user: {
      _id: user._id,
      email: user.email,
      displayName: user.displayName,
      avatar: user.avatar,
      role: user.role
    }
  }
}

/**
 * Làm mới access token bằng refresh token
 */
const refreshToken = async (clientRefreshToken) => {
  try {
    const decoded = jwt.verify(clientRefreshToken, env.JWT_REFRESH_SECRET)

    const user = await userModel.findOneById(decoded._id)
    if (!user) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'User not found!')
    }

    // Tạo access token mới
    const accessToken = jwt.sign(
      { _id: user._id, email: user.email, role: user.role },
      env.JWT_SECRET,
      { expiresIn: '1h' }
    )

    // Tạo refresh token mới (rotation)
    const newRefreshToken = jwt.sign(
      { _id: user._id, email: user.email },
      env.JWT_REFRESH_SECRET,
      { expiresIn: '14d' }
    )

    return { accessToken, refreshToken: newRefreshToken }
  } catch (error) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Refresh token không hợp lệ!')
  }
}

export const authService = {
  register,
  login,
  refreshToken
}
