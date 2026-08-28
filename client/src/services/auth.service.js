import api from './api.js'

export const login = async (email, password) => {
  const data = await api.post('/auth/login', { email, password })
  if (data.accessToken) {
    localStorage.setItem('ss_access_token', data.accessToken)
  }
  return data
}

export const register = async (payload) => {
  const data = await api.post('/auth/register', payload)
  if (data?.accessToken) {
    localStorage.setItem('ss_access_token', data.accessToken)
  }
  return data
}

export const logout = async () => {
  await api.post('/auth/logout')
  localStorage.removeItem('ss_access_token')
}

export const refreshToken = async () => {
  const data = await api.post('/auth/refresh-token')
  if (data.accessToken) {
    localStorage.setItem('ss_access_token', data.accessToken)
  }
  return data
}

export const forgotPassword = async (email) => {
  return api.post('/auth/forgot-password', { email })
}

export const resetPassword = async (token, password) => {
  return api.post('/auth/reset-password', { token, password })
}

export const verifyEmail = async (token) => {
  return api.get(`/auth/verify-email?token=${token}`)
}

export const resendVerification = async () => {
  return api.post('/auth/resend-verification')
}

export const getMe = async () => {
  return api.get('/auth/me')
}
