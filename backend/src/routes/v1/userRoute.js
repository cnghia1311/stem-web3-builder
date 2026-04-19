import express from 'express'
import { userController } from '../../controllers/userController.js'
import { authMiddleware } from '../../middlewares/authMiddleware.js'

const Router = express.Router()

// Tất cả route user đều cần auth
Router.use(authMiddleware.isAuthorized)

// GET + PUT /api/v1/users/me
Router.route('/me')
  .get(userController.getMe)
  .put(userController.updateMe)

export const userRoute = Router
