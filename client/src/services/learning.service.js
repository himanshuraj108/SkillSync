import api from './api.js'

export const getLearningOverview = async () => {
  return api.get('/learning')
}

export const getSkillProgress = async (skillId) => {
  return api.get(`/learning/${skillId}`)
}

export const generateRoadmap = async (skillId) => {
  return api.post(`/learning/${skillId}/generate-roadmap`)
}

export const updateMilestone = async (skillId, milestoneIdx) => {
  return api.patch(`/learning/${skillId}/milestone/${milestoneIdx}`)
}

export const addWeakTopic = async (skillId, topic) => {
  return api.post(`/learning/${skillId}/weak-topic`, { topic })
}

export const getRecommendations = async (skillId) => {
  return api.get(`/learning/${skillId}/recommendations`)
}
