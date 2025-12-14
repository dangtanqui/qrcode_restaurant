import axios from 'axios'
import { getApiBaseUrl } from './config'

const API_BASE_URL = getApiBaseUrl()

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  // Set Content-Type to application/json only if not FormData
  if (!(config.data instanceof FormData)) {
    if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json'
    }
  } else {
    // For FormData, delete Content-Type to let browser set it with boundary automatically
    delete config.headers['Content-Type']
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect if not already on login/signup page
      const currentPath = window.location.pathname
      if (currentPath !== '/login' && currentPath !== '/signup') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)



