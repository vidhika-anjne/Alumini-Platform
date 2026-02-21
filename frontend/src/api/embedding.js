import api from './client'

/**
 * Search alumni using AI-powered semantic search
 * @param {string} query - Natural language search query
 * @param {number} topK - Number of results to return (default: 10)
 * @returns {Promise} Search results with alumni and similarity scores
 */
export const searchAlumniByAI = async (query, topK = 10) => {
  const response = await api.post('/api/v1/embedding/search', {
    query,
    topK
  })
  return response.data
}

/**
 * Get embedding for a specific alumni
 * @param {string} enrollmentNumber - Alumni enrollment number
 * @returns {Promise} Alumni embedding data
 */
export const getAlumniEmbedding = async (enrollmentNumber) => {
  const response = await api.get(`/api/v1/embedding/alumni/${enrollmentNumber}`)
  return response.data
}

/**
 * Check if embedding service is available
 * @returns {Promise} Health status
 */
export const checkEmbeddingServiceHealth = async () => {
  const response = await api.get('/api/v1/embedding/health')
  return response.data
}

/**
 * Generate embedding for any text
 * @param {string} text - Text to generate embedding for
 * @returns {Promise} Embedding vector
 */
export const generateEmbedding = async (text) => {
  const response = await api.post('/api/v1/embedding/generate', { text })
  return response.data
}

/**
 * Batch generate embeddings for all alumni
 * @returns {Promise} Generation results
 */
export const batchGenerateEmbeddings = async () => {
  const response = await api.post('/api/v1/embedding/batch-generate')
  return response.data
}

/**
 * Refresh embedding for a specific alumni
 * @param {string} enrollmentNumber - Alumni enrollment number
 * @returns {Promise} Updated embedding
 */
export const refreshAlumniEmbedding = async (enrollmentNumber) => {
  const response = await api.post(`/api/v1/embedding/alumni/${enrollmentNumber}/refresh`)
  return response.data
}
