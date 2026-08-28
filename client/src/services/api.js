import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  timeout: 10000,
})

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common['Authorization']
  }
}

export const clearAuthToken = () => {
  delete api.defaults.headers.common['Authorization']
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ss_access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => Promise.reject(error))

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (error.response.data?.code === 'TOKEN_EXPIRED') {
        if (isRefreshing) {
          return new Promise(function(resolve, reject) {
            failedQueue.push({ resolve, reject })
          }).then(token => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token
            return api(originalRequest)
          }).catch(err => Promise.reject(err))
        }

        originalRequest._retry = true
        isRefreshing = true

        try {
          const { data } = await axios.post('/api/auth/refresh-token', {}, { withCredentials: true })
          if (data?.accessToken) {
            localStorage.setItem('ss_access_token', data.accessToken)
            setAuthToken(data.accessToken)
            processQueue(null, data.accessToken)
            originalRequest.headers['Authorization'] = 'Bearer ' + data.accessToken
            return api(originalRequest)
          }
          throw new Error('Refresh failed')
        } catch (err) {
          processQueue(err, null)
          localStorage.removeItem('ss_access_token')
          if (!window.location.pathname.startsWith('/auth') && window.location.pathname !== '/') {
            window.location.href = '/auth/login'
          }
          return Promise.reject(err)
        } finally {
          isRefreshing = false
        }
      }
    }
    return Promise.reject({
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
      errors: error.response?.data?.errors,
    })
  }
)

export default api
