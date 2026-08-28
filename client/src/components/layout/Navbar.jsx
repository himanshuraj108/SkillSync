import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, ArrowLeftRight, LogOut, User, Settings, Sun, Moon, Sparkles } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar.jsx'
import { useAuthStore } from '@/store/authStore.js'
import { useNotificationStore } from '@/store/notificationStore.js'
import { useThemeStore } from '@/store/themeStore.js'
import { logout } from '@/services/auth.service.js'

export function Navbar() {
  const { user, clearUser } = useAuthStore()
  const { unreadCount } = useNotificationStore()
  const { theme, toggleTheme } = useThemeStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
    } catch {}
    clearUser()
    navigate('/auth/login')
  }

  return (
    <header
      className="fixed top-0 inset-x-0 z-40 flex h-14 items-center justify-between border-b px-4 lg:hidden"
      style={{ backgroundColor: 'rgb(var(--bg))', borderColor: 'rgb(var(--border))' }}
    >
      <Link to="/dashboard" className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 shadow-sm">
          <ArrowLeftRight className="h-4 w-4 text-white" />
        </div>
        <span className="text-sm font-bold tracking-tight" style={{ color: 'rgb(var(--text-primary))' }}>
          SkillSync
        </span>
      </Link>

      <div className="flex items-center gap-1.5">
        {/* Theme switch */}
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 transition-colors hover:bg-neutral-800/40 text-neutral-400 hover:text-neutral-200"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Notifications */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative rounded-lg p-2 transition-colors hover:bg-neutral-800/40 text-neutral-400 hover:text-neutral-200"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-indigo-600 text-[9px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* User Profile Avatar & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center justify-center"
            aria-label="User menu"
          >
            <Avatar src={user?.avatar?.url} name={user?.name} size="sm" />
          </button>

          {menuOpen && (
            <>
              {/* Solid Click-away backdrop */}
              <div
                className="fixed inset-0 z-40 bg-black/40"
                onClick={() => setMenuOpen(false)}
              />

              {/* Solid Opaque Dropdown (No bleeding through) */}
              <div
                className="absolute right-0 top-12 w-56 rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl p-2 z-50 overflow-hidden"
              >
                {/* User Header Summary */}
                <div className="px-3 py-2.5 mb-1 rounded-xl bg-neutral-950/60 border border-neutral-800/60">
                  <p className="text-xs font-bold text-neutral-100 truncate">{user?.name || 'Member'}</p>
                  {user?.email && <p className="text-[11px] text-neutral-400 truncate mt-0.5">{user.email}</p>}
                  <div className="flex items-center gap-1 mt-1.5 text-[10px] text-indigo-400 font-semibold">
                    <Sparkles className="h-3 w-3" />
                    <span className="capitalize">{user?.role || 'Member'} · {user?.reputation?.score ?? 0} Rep</span>
                  </div>
                </div>

                <div className="space-y-0.5 pt-1">
                  <Link
                    to={`/profile/${user?._id || 'me'}`}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-neutral-200 hover:bg-neutral-800 transition-colors"
                  >
                    <User className="h-4 w-4 text-neutral-400" />
                    <span>My Profile</span>
                  </Link>

                  <Link
                    to="/settings"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-neutral-200 hover:bg-neutral-800 transition-colors"
                  >
                    <Settings className="h-4 w-4 text-neutral-400" />
                    <span>Settings</span>
                  </Link>
                </div>

                <hr className="my-1.5 border-neutral-800" />

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
