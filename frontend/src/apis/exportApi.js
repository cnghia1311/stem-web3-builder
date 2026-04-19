import axiosInstance from './index'

/**
 * Gọi API export từ backend
 */

// POST /api/v1/export/html — cần auth
export const exportHtmlAPI = async (data) => {
  return await axiosInstance.post('/export/html', data)
}

// POST /api/v1/export/save — cần auth
export const exportSaveAPI = async (data) => {
  return await axiosInstance.post('/export/save', data)
}
