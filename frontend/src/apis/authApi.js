import axiosInstance from '~/apis'

/**
 * Đăng ký tài khoản mới
 * POST /api/v1/auth/register
 */
export const registerAPI = async (data) => {
  return axiosInstance.post('/auth/register', data)
}

/**
 * Đăng nhập
 * POST /api/v1/auth/login
 */
export const loginAPI = async (data) => {
  return axiosInstance.post('/auth/login', data)
}

/**
 * Làm mới access token
 * PUT /api/v1/auth/refresh-token
 */
export const refreshTokenAPI = async () => {
  return axiosInstance.put('/auth/refresh-token')
}

/**
 * Đăng xuất
 * DELETE /api/v1/auth/logout
 */
export const logoutAPI = async () => {
  return axiosInstance.delete('/auth/logout')
}
