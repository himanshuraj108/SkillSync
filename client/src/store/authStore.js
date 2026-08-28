import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      clearUser: () => {
        localStorage.removeItem('ss_access_token')
        set({ user: null, isAuthenticated: false })
      },
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'ss_user',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)
