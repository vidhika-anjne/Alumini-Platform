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
    // Recursively ensure all Cloudinary URLs use HTTPS to prevent tracking prevention issues
    const ensureSecureUrl = (obj) => {
      if (!obj || typeof obj !== 'object') return obj
      if (Array.isArray(obj)) {
        return obj.map(ensureSecureUrl)
      }
      for (const key in obj) {
        if (typeof obj[key] === 'string' && obj[key].startsWith('http://res.cloudinary.com/')) {
          obj[key] = obj[key].replace('http://', 'https://')
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          ensureSecureUrl(obj[key])
        }
      }
      return obj
    }

    if (response.data) {
      ensureSecureUrl(response.data)
    }
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
