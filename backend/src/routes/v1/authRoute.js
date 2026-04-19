import express from 'express'
import { authValidation } from '../../validations/authValidation.js'
import { authController } from '../../controllers/authController.js'
import { authMiddleware } from '../../middlewares/authMiddleware.js'

const Router = express.Router()

// POST /api/v1/auth/register
Router.route('/register')
  .post(authValidation.register, authController.register)

// POST /api/v1/auth/login
Router.route('/login')
  .post(authValidation.login, authController.login)

// PUT /api/v1/auth/refresh-token
Router.route('/refresh-token')
  .put(authController.refreshToken)

// DELETE /api/v1/auth/logout
Router.route('/logout')
  .delete(authMiddleware.isAuthorized, authController.logout)

export const authRoute = Router
