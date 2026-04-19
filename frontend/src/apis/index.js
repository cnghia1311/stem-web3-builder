import axios from 'axios'
import { API_BASE_URL } from '~/utils/constants'

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true // Gửi cookie (refreshToken) trong mọi request
})

// Request interceptor — tự động gắn JWT access token vào header
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken')
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — xử lý lỗi + auto refresh token
axiosInstance.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config

    // 410 GONE = Token hết hạn → thử refresh
    if (error.response?.status === 410 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Gọi API refresh token (dùng cookie httpOnly)
        const res = await axiosInstance.put('/auth/refresh-token')
        const newAccessToken = res.accessToken

        // Lưu token mới
        localStorage.setItem('accessToken', newAccessToken)

        // Gắn token mới vào request cũ rồi gửi lại
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        // Refresh token cũng hết hạn → đăng xuất
        localStorage.removeItem('accessToken')
        localStorage.removeItem('stem-user')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export default axiosInstance
