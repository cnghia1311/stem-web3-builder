import express from 'express'
import { exportController } from '../../controllers/exportController.js'
import { authMiddleware } from '../../middlewares/authMiddleware.js'

const Router = express.Router()

// POST /api/v1/export/preview — Preview HTML (trả string, public)
Router.route('/preview')
  .post(exportController.exportPreview)

// POST /api/v1/export/save — Lưu file HTML → trả URL
// Dùng optionalAuth: nếu có JWT → ghi metadata vào MongoDB, không có cũng OK
Router.route('/save')
  .post(authMiddleware.optionalAuth, exportController.exportSave)

export const exportRoute = Router
