import { StatusCodes } from 'http-status-codes'
import { exportService } from '../services/exportService.js'

/**
 * POST /api/v1/export/preview — Public, không cần auth
 * Nhận tabs + config + contracts → trả HTML string
 */
const exportPreview = async (req, res, next) => {
  try {
    const result = await exportService.buildHtmlFromData(req.body)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

/**
 * POST /api/v1/export/html — Nối HTML từ cache → trả string
 */
const exportHtml = async (req, res, next) => {
  try {
    const result = await exportService.exportHtml(req.body)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

/**
 * POST /api/v1/export/save — Nhận tabs + config + contracts → lưu file HTML → trả URL
 * Nếu có JWT → ghi metadata vào MongoDB (gắn userId)
 */
const exportSave = async (req, res, next) => {
  try {
    // Lấy user info từ JWT (nếu có đăng nhập)
    const userInfo = req.jwtDecoded || null
    const result = await exportService.saveHtmlFromData(req.body, userInfo)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

export const exportController = {
  exportPreview,
  exportHtml,
  exportSave
}
