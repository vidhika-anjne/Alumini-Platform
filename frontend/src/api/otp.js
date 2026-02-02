import api from './client'

export async function sendOtp(email) {
  // Backend endpoint for sending OTP
  const res = await api.post('/api/v1/auth/send-otp', { email })
  return res.data
}

export async function verifyOtp(email, otp) {
  // Backend endpoint for verifying OTP (checks validity against storage)
  const res = await api.post('/api/v1/auth/verify-otp', { email, otp })
  return res.data
}
