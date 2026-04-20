import { StatusCodes } from 'http-status-codes'
import { appService } from '../services/appService.js'

/**
 * GET /api/v1/apps/my — Danh sách apps CỦA TÔI (cần auth)
 */
const getMyApps = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    console.log('🔍 [getMyApps] userId from JWT:', userId, typeof userId)
    const apps = await appService.getMyApps(userId)
    console.log('🔍 [getMyApps] found apps:', apps.length)
    res.status(StatusCodes.OK).json(apps)
  } catch (error) {
    console.error('❌ [getMyApps] error:', error.message)
    next(error)
  }
}

/**
 * GET /api/v1/apps/explore — Khám phá apps công khai (public, có phân trang)
 */
const explore = async (req, res, next) => {
  try {
    const result = await appService.explore(req.query)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

/**
 * DELETE /api/v1/apps/:filename — Xóa app (cần auth + ownership)
 */
const deleteApp = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const result = await appService.deleteApp(req.params.filename, userId)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

export const appController = {
  getMyApps,
  explore,
  deleteApp
}
