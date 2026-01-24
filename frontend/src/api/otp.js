import api from './client'

export async function sendOtp(email) {
  const res = await api.post('/api/v1/otp/send', { email })
  return res.data
}

export async function verifyOtp(email, otp) {
  const res = await api.post('/api/v1/otp/verify', { email, otp })
  return res.data
}
