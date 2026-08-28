import api from './api.js'

export const getNotifications = async (params = {}) => {
  return api.get('/notifications', { params })
}

export const markRead = async (notificationId) => {
  return api.patch(`/notifications/${notificationId}/read`)
}

export const markAllRead = async () => {
  return api.patch('/notifications/read-all')
}

export const getUnreadCount = async () => {
  return api.get('/notifications/unread-count')
}
