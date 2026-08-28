import api from './api.js'

export const discoverMatches = async (params = {}) => {
  return api.get('/matches/discover', { params })
}

export const sendMatchRequest = async (data) => {
  return api.post('/matches/request', data)
}

export const getMyMatches = async (params = {}) => {
  return api.get('/matches/my-matches', { params })
}

export const getMatch = async (matchId) => {
  return api.get(`/matches/${matchId}`)
}

export const respondToMatch = async (matchId, action) => {
  return api.post(`/matches/${matchId}/respond`, { action })
}

export const cancelMatch = async (matchId) => {
  return api.post(`/matches/${matchId}/cancel`)
}
