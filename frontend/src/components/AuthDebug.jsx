import { useAuth } from '../context/AuthContext'
import api from '../api/client'

export default function AuthDebug() {
  const { token, user, userType } = useAuth()
  
  const checkToken = () => {
    console.log('=== AUTH DEBUG ===')
    console.log('Token from context:', token ? `${token.substring(0, 20)}...` : 'null')
    console.log('Token from localStorage:', localStorage.getItem('token') ? `${localStorage.getItem('token').substring(0, 20)}...` : 'null')
    console.log('User Type:', userType)
    console.log('User:', user)
    
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        console.log('Token payload:', payload)
        console.log('Token expires at:', new Date(payload.exp * 1000))
        console.log('Token expired?:', Date.now() >= payload.exp * 1000)
        console.log('Token subject:', payload.sub)
      } catch (e) {
        console.error('Invalid token format:', e)
      }
    }
    console.log('=================')
  }

  const testAPI = async () => {
    console.log('=== API TESTS ===')
    
    // Test public endpoint
    try {
      console.log('Testing public endpoint...')
      const publicResponse = await api.get('/api/v1/debug/public')
      console.log('✅ Public endpoint successful:', publicResponse.data)
    } catch (error) {
      console.error('❌ Public endpoint failed:', error)
    }

    // Test auth endpoint
    try {
      console.log('Testing auth endpoint...')
      const authResponse = await api.get('/api/v1/debug/auth')
      console.log('✅ Auth endpoint successful:', authResponse.data)
    } catch (error) {
      console.error('❌ Auth endpoint failed:', error)
    }

    // Test alumni endpoint
    try {
      console.log('Testing alumni endpoint...')
      const response = await api.get('/api/v1/alumni')
      console.log('✅ Alumni API call successful:', response.data?.length, 'records')
    } catch (error) {
      console.error('❌ Alumni API call failed:', error.response?.status, error.response?.data)
    }
    console.log('===============')
  }

  const clearAuth = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('userType')
    console.log('Auth cleared, reloading...')
    window.location.reload()
  }

  const isTokenPresent = token && token.trim() !== ''
  const isStorageTokenPresent = localStorage.getItem('token') && localStorage.getItem('token').trim() !== ''

  return (
    <div style={{ 
      position: 'fixed', 
      top: 10, 
      right: 10, 
      background: isTokenPresent ? '#e8f5e8' : '#ffe8e8', 
      padding: '10px', 
      borderRadius: '5px', 
      fontSize: '12px',
      border: '1px solid #ccc',
      zIndex: 1000
    }}>
      <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>
        Auth Status: {isTokenPresent ? '✅ Token Present' : '❌ No Token'}
      </div>
      <div style={{ marginBottom: '8px' }}>
        Storage: {isStorageTokenPresent ? '✅' : '❌'} | Context: {isTokenPresent ? '✅' : '❌'}
      </div>
      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
        <button onClick={checkToken} style={{ fontSize: '11px' }}>Check Auth</button>
        <button onClick={testAPI} style={{ fontSize: '11px' }}>Test API</button>
        <button onClick={clearAuth} style={{ fontSize: '11px' }}>Clear Auth</button>
      </div>
    </div>
  )
}