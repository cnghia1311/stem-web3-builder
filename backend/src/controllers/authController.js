import { StatusCodes } from 'http-status-codes'
import { authService } from '../services/authService.js'

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body)

    // Set refresh token vào httpOnly cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: false, // true khi production (HTTPS)
      sameSite: 'strict',
      maxAge: 14 * 24 * 60 * 60 * 1000 // 14 ngày
    })

    res.status(StatusCodes.CREATED).json({
      accessToken: result.accessToken,
      user: result.user
    })
  } catch (error) { next(error) }
}

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body)

    // Set refresh token vào httpOnly cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 14 * 24 * 60 * 60 * 1000
    })

    res.status(StatusCodes.OK).json({
      accessToken: result.accessToken,
      user: result.user
    })
  } catch (error) { next(error) }
}

const refreshToken = async (req, res, next) => {
  try {
    const clientRefreshToken = req.cookies?.refreshToken
    const result = await authService.refreshToken(clientRefreshToken)

    // Set refresh token mới vào cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 14 * 24 * 60 * 60 * 1000
    })

    res.status(StatusCodes.OK).json({ accessToken: result.accessToken })
  } catch (error) { next(error) }
}

const logout = async (req, res, next) => {
  try {
    // Xóa refresh token cookie
    res.clearCookie('refreshToken')
    res.status(StatusCodes.OK).json({ loggedOut: true })
  } catch (error) { next(error) }
}

export const authController = {
  register,
  login,
  refreshToken,
  logout
}
