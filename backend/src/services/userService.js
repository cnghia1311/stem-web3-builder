import { userModel } from '../models/userModel.js'

/**
 * Lấy thông tin user hiện tại
 */
const getMe = async (userId) => {
  const user = await userModel.findOneById(userId)

  if (!user) return null

  // Không trả password
  const { password, ...userWithoutPassword } = user
  return userWithoutPassword
}

/**
 * Cập nhật thông tin user (displayName, avatar)
 */
const updateMe = async (userId, updateData) => {
  const updatedUser = await userModel.update(userId, updateData)

  if (!updatedUser) return null

  // Không trả password
  const { password, ...userWithoutPassword } = updatedUser
  return userWithoutPassword
}

export const userService = {
  getMe,
  updateMe
}
