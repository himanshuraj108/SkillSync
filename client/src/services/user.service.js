import api from './api.js'

export const getProfile = async (userId) => {
  return api.get(`/users/${userId}`)
}

export const updateProfile = async (data) => {
  return api.put('/users/profile', data)
}

export const updateSkills = async (data) => {
  return api.put('/users/skills', data)
}

export const updateAvailability = async (data) => {
  return api.put('/users/availability', data)
}

export const getUserReviews = async (userId, params = {}) => {
  return api.get(`/users/${userId}/reviews`, { params })
}

export const searchUsers = async (query, params = {}) => {
  return api.get('/users/search', { params: { q: query, ...params } })
}

export const deleteAccount = async () => {
  return api.delete('/users/account')
}

export const uploadAvatar = async (formData) => {
  return api.put('/users/avatar', formData)
}
