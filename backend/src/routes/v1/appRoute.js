import express from 'express'
import { appController } from '../../controllers/appController.js'
import { authMiddleware } from '../../middlewares/authMiddleware.js'

const Router = express.Router()

// ═══ PUBLIC ROUTES ═══

// GET /api/v1/apps/explore?page=1&limit=12&search=NFT&author=nghia&sort=newest
Router.route('/explore')
  .get(appController.explore)

// ═══ PROTECTED ROUTES (cần đăng nhập) ═══
Router.use(authMiddleware.isAuthorized)

// GET /api/v1/apps/my — Danh sách apps của tôi
Router.route('/my')
  .get(appController.getMyApps)

// DELETE /api/v1/apps/:filename — Xóa app (kiểm tra ownership)
Router.route('/:filename')
  .delete(appController.deleteApp)

export const appRoute = Router
