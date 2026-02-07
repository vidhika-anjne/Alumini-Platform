import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8080',
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    console.log('API Request Interceptor:')
    console.log('- URL:', config.url)
    console.log('- Method:', config.method)
    console.log('- Token from localStorage:', token ? `${token.substring(0, 20)}...` : 'null')
    
    if (token && token.trim() !== '') {
      config.headers.Authorization = `Bearer ${token}`
      console.log('- Authorization header set:', config.headers.Authorization?.substring(0, 30) + '...')
    } else {
      console.warn('- No valid token found, request will be unauthenticated')
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
    console.error('API Response Error:')
    console.error('- Status:', error.response?.status)
    console.error('- Data:', error.response?.data)
    console.error('- Headers:', error.response?.headers)
    
    if (error.response?.status === 401) {
      console.warn('Unauthorized request - token may be invalid or expired')
      // Optional: Clear invalid token
      // localStorage.removeItem('token')
      // window.location.href = '/login'
    }
    
    return Promise.reject(error)
  }
)

export default api
