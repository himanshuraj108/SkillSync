import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar.jsx'
import { MobileNav } from './MobileNav.jsx'
import { Navbar } from './Navbar.jsx'
import { EmailVerificationBanner } from './EmailVerificationBanner.jsx'
import { useSocket } from '@/hooks/useSocket.js'
import { cn } from '@/lib/utils.js'

export function DashboardLayout() {
  useSocket()
  const location = useLocation()
  const isChat = location.pathname.startsWith('/chat')

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className={cn(
      "bg-slate-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-150",
      isChat ? "h-screen overflow-hidden fixed inset-0" : "min-h-screen"
    )}>
      <Sidebar />
      <Navbar />

      <main className={cn(
        "lg:pl-64 flex flex-col",
        isChat ? "h-full pb-16 lg:pb-0 overflow-hidden" : "pb-16 lg:pb-0 min-h-screen"
      )}>
        <EmailVerificationBanner />
        <div className={cn(
          "pt-14 lg:pt-0 flex-1 flex flex-col",
          isChat ? "h-[calc(100%-3.5rem)] lg:h-full overflow-hidden" : "min-h-screen"
        )}>
          <Outlet />
        </div>
      </main>

      <MobileNav />
    </div>
  )
}
