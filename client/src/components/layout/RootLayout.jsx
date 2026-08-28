import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner.jsx'
import { useAuth } from '@/hooks/useAuth.js'
import { useThemeStore } from '@/store/themeStore.js'

export function RootLayout() {
  const { isLoading } = useAuth()
  const { theme } = useThemeStore()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  if (isLoading) {
    return <LoadingSpinner fullPage label="Loading SkillSync..." />
  }

  return <Outlet />
}
