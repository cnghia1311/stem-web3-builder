import express from 'express'
import { blockController } from '../../controllers/blockController.js'
import { authMiddleware } from '../../middlewares/authMiddleware.js'

const Router = express.Router()

// GET /api/v1/blocks/metadata — Không cần auth (public)
Router.route('/metadata')
  .get(blockController.getMetadata)

// POST /api/v1/blocks/batch-code — Cần auth
Router.route('/batch-code')
  .post(authMiddleware.isAuthorized, blockController.getBatchCode)

export const blockRoute = Router
