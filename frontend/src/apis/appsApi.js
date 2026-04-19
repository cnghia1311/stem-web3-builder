import axiosInstance from '~/apis'

/**
 * GET /api/v1/apps/my — Apps của tôi (cần auth)
 */
export const fetchMyApps = async () => {
  return axiosInstance.get('/apps/my')
}

/**
 * GET /api/v1/apps/explore — Khám phá apps (public)
 */
export const exploreApps = async (params = {}) => {
  return axiosInstance.get('/apps/explore', { params })
}

/**
 * DELETE /api/v1/apps/:filename — Xóa app (cần auth + ownership)
 */
export const deleteApp = async (filename) => {
  return axiosInstance.delete(`/apps/${filename}`)
}
