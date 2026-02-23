import api from './client'

/**
 * Get any user's profile by enrollment number
 * Automatically searches both Alumni and Student tables
 * @param {string} enrollmentNumber - The enrollment number
 * @returns {Promise} Profile data with unified format
 */
export const getProfile = async (enrollmentNumber) => {
  const response = await api.get(`/api/v1/profiles/${enrollmentNumber}`)
  return response.data
}

/**
 * Get alumni profile specifically
 * @param {string} enrollmentNumber - The enrollment number
 * @returns {Promise} Alumni profile data
 */
export const getAlumniProfile = async (enrollmentNumber) => {
  const response = await api.get(`/api/v1/profiles/alumni/${enrollmentNumber}`)
  return response.data
}

/**
 * Get student profile specifically
 * @param {string} enrollmentNumber - The enrollment number
 * @returns {Promise} Student profile data
 */
export const getStudentProfile = async (enrollmentNumber) => {
  const response = await api.get(`/api/v1/profiles/student/${enrollmentNumber}`)
  return response.data
}

/**
 * Check if a user exists by enrollment number
 * @param {string} enrollmentNumber - The enrollment number to check
 * @returns {Promise} Response with existence status and user type
 */
export const checkUserExists = async (enrollmentNumber) => {
  const response = await api.get(`/api/v1/profiles/check/${enrollmentNumber}`)
  return response.data
}

/**
 * Get connection status with another user
 * @param {string} enrollmentNumber - The other user's enrollment number
 * @returns {Promise} Connection status
 */
export const getConnectionStatus = async (enrollmentNumber) => {
  const response = await api.get(`/api/v1/connections/status/${enrollmentNumber}`)
  return response.data
}

/**
 * Send connection request to another user
 * @param {string} receiverEnrollment - The receiver's enrollment number
 * @returns {Promise} Request response
 */
export const sendConnectionRequest = async (receiverEnrollment) => {
  const response = await api.post(`/api/v1/connections/request/${receiverEnrollment}`)
  return response.data
}

/**
 * Get posts for a user
 * @param {string} enrollmentNumber - The user's enrollment number
 * @returns {Promise} User's posts
 */
export const getPostsForUser = async (enrollmentNumber) => {
  const response = await api.get(`/api/v1/posts/user/${enrollmentNumber}`)
  return response.data
}

/**
 * Delete a post
 * @param {number} postId - The ID of the post to delete
 * @returns {Promise} Response
 */
export const deletePost = async (postId) => {
    const response = await api.delete(`/api/v1/posts/${postId}`)
    return response.data
}
