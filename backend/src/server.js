/* eslint-disable no-console */
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { env } from './config/environment.js'
import { CONNECT_DB, CLOSE_DB } from './config/mongodb.js'
import { corsOptions } from './config/cors.js'
import { APIs_V1 } from './routes/v1/index.js'
import { errorHandlingMiddleware } from './middlewares/errorHandling.js'
import { blockCache } from './engine/blockCache.js'

const START_SERVER = () => {
  const app = express()

  // Middlewares
  app.use(cors(corsOptions))
  app.use(cookieParser())
  app.use(express.json())

  // Serve static files từ thư mục apps (HTML đã xuất)
  // Thêm CSP header cho phép ethers.js hoạt động (cần eval cho ABI encoding)
  app.use('/apps', (req, res, next) => {
    res.setHeader(
      'Content-Security-Policy',
      "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; script-src * 'unsafe-inline' 'unsafe-eval'; style-src * 'unsafe-inline';"
    )
    next()
  }, express.static('apps'))

  // API Routes v1
  app.use('/api/v1', APIs_V1)

  // Centralized error handling — phải đặt cuối cùng
  app.use(errorHandlingMiddleware)

  // Start server
  app.listen(env.PORT, () => {
    console.log('')
    console.log('🚀 ═══════════════════════════════════════════')
    console.log(`   STEM Web3 Builder API`)
    console.log(`   Running at: http://localhost:${env.PORT}`)
    console.log(`   Mode: ${env.BUILD_MODE}`)
    console.log('═══════════════════════════════════════════════')
    console.log('')
  })
}

// Kết nối DB → Load block cache → Start server
console.log('🔌 Connecting to MongoDB...')
CONNECT_DB()
  .then(async () => {
    console.log('✅ Connected to MongoDB successfully!')
    console.log('')

    // Load block cache từ data/blocks/
    console.log('📦 Loading block cache...')
    await blockCache.load()
    console.log('')
  })
  .then(() => START_SERVER())
  .catch(async (error) => {
    console.error('❌ Failed to connect to MongoDB:', error)
    console.log('')
    console.log('⚠️  Starting server WITHOUT database...')
    console.log('   (Block cache + export vẫn hoạt động)')
    console.log('')

    // Vẫn load block cache
    await blockCache.load()
    START_SERVER()
  })

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...')
  CLOSE_DB()
    .then(() => {
      console.log('✅ MongoDB disconnected.')
      process.exit(0)
    })
    .catch(() => process.exit(0))
})
