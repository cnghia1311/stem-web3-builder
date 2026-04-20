import { StatusCodes } from 'http-status-codes'
import { appModel } from '../models/appModel.js'
import ApiError from '../utils/ApiError.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const APPS_DIR = path.resolve(__dirname, '../../apps')

/**
 * Lấy danh sách apps CỦA TÔI (cần userId từ JWT)
 */
const getMyApps = async (userId) => {
  return await appModel.getListByUserId(userId)
}

/**
 * Khám phá apps công khai (phân trang + tìm kiếm + lọc)
 */
const explore = async (query) => {
  const page = parseInt(query.page) || 1
  const limit = Math.min(parseInt(query.limit) || 12, 50) // Max 50
  const search = query.search || ''
  const author = query.author || ''
  const sort = query.sort || 'newest'

  return await appModel.explore({ page, limit, search, author, sort })
}

/**
 * Xóa app — kiểm tra ownership + xóa file vật lý + soft delete trong DB
 */
const deleteApp = async (filename, userId) => {
  // Chống path traversal
  if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Tên file không hợp lệ!')
  }

  // Tìm metadata trong DB
  const app = await appModel.findOneByFilename(filename)
  if (!app) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy app: ' + filename)
  }

  // Kiểm tra ownership — chỉ chủ sở hữu mới được xóa
  if (app.userId !== userId) {
    throw new ApiError(StatusCodes.FORBIDDEN, 'Bạn không có quyền xóa app này!')
  }

  // Xóa file vật lý
  const filePath = path.join(APPS_DIR, filename)
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath)
  }

  // Xóa hẳn trong DB
  await appModel.deleteOneById(app._id.toString())

  return { message: 'Đã xóa: ' + filename }
}

export const appService = {
  getMyApps,
  explore,
  deleteApp
}
