import api from './api.js'

export const getConversations = async () => {
  return api.get('/conversations')
}

export const getConversation = async (conversationId) => {
  return api.get(`/conversations/${conversationId}`)
}

export const getMessages = async (conversationId, params = {}) => {
  return api.get(`/conversations/${conversationId}/messages`, { params })
}

export const sendMessage = async (conversationId, data) => {
  return api.post(`/conversations/${conversationId}/messages`, data)
}

export const markRead = async (conversationId) => {
  return api.patch(`/conversations/${conversationId}/read`)
}

export const uploadChatFile = async (formData) => {
  return api.post('/upload/file', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
