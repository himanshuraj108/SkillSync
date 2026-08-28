import api from './api.js'

export const createSession = async (data) => {
  return api.post('/sessions', data)
}

export const getSessions = async (params = {}) => {
  return api.get('/sessions', { params })
}

export const getUpcomingSessions = async () => {
  return api.get('/sessions/upcoming')
}

export const getSession = async (sessionId) => {
  return api.get(`/sessions/${sessionId}`)
}

export const updateSession = async (sessionId, data) => {
  return api.put(`/sessions/${sessionId}`, data)
}

export const startSession = async (sessionId) => {
  return api.post(`/sessions/${sessionId}/start`)
}

export const completeSession = async (sessionId, data) => {
  return api.post(`/sessions/${sessionId}/complete`, data)
}

export const cancelSession = async (sessionId, reason) => {
  return api.post(`/sessions/${sessionId}/cancel`, { reason })
}

export const setRecordingConsent = async (sessionId, consent) => {
  return api.post(`/sessions/${sessionId}/recording-consent`, { consent })
}

export const uploadSessionRecording = async (sessionId, formData) => {
  return api.post(`/sessions/${sessionId}/recording-upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 120000, // 2 minutes for video upload
  })
}

export const deleteSessionRecording = async (sessionId) => {
  return api.delete(`/sessions/${sessionId}/recording`)
}
