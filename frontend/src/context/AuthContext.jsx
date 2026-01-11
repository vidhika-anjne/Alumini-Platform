import { createContext, useContext, useEffect, useState } from 'react'
import api from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [userType, setUserType] = useState(localStorage.getItem('userType') || '')
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  })

  useEffect(() => {
    if (token) localStorage.setItem('token', token)
    else localStorage.removeItem('token')
  }, [token])

  useEffect(() => {
    if (userType) localStorage.setItem('userType', userType)
    else localStorage.removeItem('userType')
  }, [userType])

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user))
    else localStorage.removeItem('user')
  }, [user])

  const login = async (role, enrollmentNumber, password) => {
    const url = role === 'alumni' ? '/api/v1/alumni/login' : '/api/v1/students/login'
    const { data } = await api.post(url, { enrollmentNumber, password })
    const tok = data.token
    const utype = data.userType || role
    const obj = role === 'alumni' ? data.alumni : data.student
    setToken(tok)
    setUserType(utype)
    setUser(obj)
    return { token: tok, userType: utype, user: obj }
  }

  const register = async (role, payload) => {
    const url = role === 'alumni' ? '/api/v1/alumni/register' : '/api/v1/students/register'
    const { data } = await api.post(url, payload)
    return data
  }

  const logout = () => {
    setToken('')
    setUserType('')
    setUser(null)
  }

  // Allow updating the current user object (frontend-only fields like social links)
  const updateUser = (updates) => {
    setUser((prev) => {
      const next = typeof updates === 'function' ? updates(prev) : { ...(prev || {}), ...(updates || {}) }
      return next
    })
  }

  const value = { token, userType, user, login, register, logout, updateUser }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
