import { StatusCodes } from 'http-status-codes'
import { userService } from '../services/userService.js'

const getMe = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const user = await userService.getMe(userId)

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found' })
    }

    res.status(StatusCodes.OK).json(user)
  } catch (error) { next(error) }
}

const updateMe = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const updatedUser = await userService.updateMe(userId, req.body)

    if (!updatedUser) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'User not found' })
    }

    res.status(StatusCodes.OK).json(updatedUser)
  } catch (error) { next(error) }
}

export const userController = {
  getMe,
  updateMe
}
