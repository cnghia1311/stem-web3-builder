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
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error)
    else prom.resolve(token)
  })
  failedQueue = []
}

axiosInstance.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config

    // Tránh loop vô hạn nếu server vẫn trả 410
    if (originalRequest.headers && originalRequest.headers['x-retry']) {
      return Promise.reject(error)
    }

    if (error.response?.status === 410) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          originalRequest.headers['x-retry'] = 'true'
          return axiosInstance(originalRequest)
        })
      }

      isRefreshing = true

      try {
        const { default: axios } = await import('axios')
        const res = await axios.put(`${API_BASE_URL}/auth/refresh-token`, {}, {
          withCredentials: true,
          timeout: 10000
        })
        const newAccessToken = res.data.accessToken

        localStorage.setItem('accessToken', newAccessToken)
        processQueue(null, newAccessToken)

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        originalRequest.headers['x-retry'] = 'true'
        
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        localStorage.removeItem('accessToken')
        localStorage.removeItem('stem-user')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    console.error('API Error:', error)
    return Promise.reject(error)
  }
)

export default axiosInstance
