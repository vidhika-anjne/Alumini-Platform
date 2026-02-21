import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8080',
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    // console.log('API Request Interceptor:')
    // console.log('- URL:', config.url)
    // console.log('- Method:', config.method)
    // console.log('- Token from localStorage:', token ? `${token.substring(0, 20)}...` : 'null')
    
    if (token && token.trim() !== '') {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    console.error('Request interceptor error:', error)
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const status = error.response?.status

    if (status === 401 || status === 403) {
      console.warn('Authentication failed — clearing session and redirecting to login')
      localStorage.removeItem('token')
      localStorage.removeItem('userType')
      localStorage.removeItem('user')
      // Only redirect if not already on auth pages to avoid redirect loops
      const path = window.location.pathname
      if (path !== '/login' && path !== '/register') {
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default api
