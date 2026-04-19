import axiosInstance from './index'

/**
 * Gọi API blocks từ backend
 */

// GET /api/v1/blocks/metadata — không cần auth
export const fetchBlocksMetadataAPI = async () => {
  return await axiosInstance.get('/blocks/metadata')
}

// POST /api/v1/blocks/batch-code — cần auth (dùng khi export)
export const fetchBatchCodeAPI = async (blockIds) => {
  return await axiosInstance.post('/blocks/batch-code', { blockIds })
}
