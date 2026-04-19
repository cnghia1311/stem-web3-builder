import { StatusCodes } from 'http-status-codes'
import { blockService } from '../services/blockService.js'

/**
 * GET /api/v1/blocks/metadata — không cần auth
 * Trả danh sách metadata nhẹ cho Sidebar
 */
const getMetadata = async (req, res, next) => {
  try {
    const metadata = await blockService.getMetadata()
    res.status(StatusCodes.OK).json(metadata)
  } catch (error) { next(error) }
}

/**
 * POST /api/v1/blocks/batch-code — cần auth
 * Body: { blockIds: ['wallet', 'balance', ...] }
 * Trả code (exportHtml, engineCode, globalCode) cho nhiều block
 */
const getBatchCode = async (req, res, next) => {
  try {
    const { blockIds } = req.body
    const result = await blockService.getBatchCode(blockIds || [])
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

export const blockController = {
  getMetadata,
  getBatchCode
}
