import express from 'express'
import { authRoute } from './authRoute.js'
import { userRoute } from './userRoute.js'
import { blockRoute } from './blockRoute.js'
import { exportRoute } from './exportRoute.js'
import { appRoute } from './appRoute.js'
import { StatusCodes } from 'http-status-codes'

const Router = express.Router()

// Health check
Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({
    message: '✅ STEM Web3 Builder API v1 is running!',
    timestamp: new Date().toISOString()
  })
})

// Mount routes
Router.use('/auth', authRoute)
Router.use('/users', userRoute)
Router.use('/blocks', blockRoute)
Router.use('/export', exportRoute)
Router.use('/apps', appRoute)

export const APIs_V1 = Router
