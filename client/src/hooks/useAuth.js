import { useEffect } from 'react'
import { getMe } from '@/services/auth.service.js'
import { useAuthStore } from '@/store/authStore.js'

export function useAuth() {
  const { user, isAuthenticated, isLoading, setUser, clearUser, setLoading } = useAuthStore()

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('ss_access_token')
      if (!token && !user) {
        setLoading(false)
        return
      }
      try {
        const data = await getMe()
        if (data?.data || data?.user) {
          setUser(data.data || data.user)
        }
      } catch {
        clearUser()
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  return { user, isAuthenticated, isLoading, setUser, clearUser }
}
