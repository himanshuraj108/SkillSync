import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Compass,
  Users,
  Calendar,
  MessageSquare,
  BookOpen,
  Settings,
  LogOut,
  Sparkles,
  Sun,
  Moon,
  ChevronRight,
  Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils.js'
import { Avatar } from '@/components/ui/Avatar.jsx'
import { Badge } from '@/components/ui/Badge.jsx'
import { Logo } from '@/components/ui/Logo.jsx'
import { useAuthStore } from '@/store/authStore.js'
import { useNotificationStore } from '@/store/notificationStore.js'
import { useThemeStore } from '@/store/themeStore.js'
import { REPUTATION_TIERS } from '@/lib/constants.js'
import { logout } from '@/services/auth.service.js'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/discover', label: 'Discover', icon: Compass },
  { to: '/matches', label: 'Matches', icon: Users },
  { to: '/sessions', label: 'Sessions', icon: Calendar },
  { to: '/chat', label: 'Chat', icon: MessageSquare, badge: true },
]

const learningItems = [
  { to: '/learning', label: 'Learning Roadmap', icon: BookOpen },
]

function getRepTier(score) {
  const num = typeof score === 'number' ? score : 0
  return REPUTATION_TIERS.find((t) => num >= t.min && num <= t.max) || REPUTATION_TIERS[0]
}

export function Sidebar() {
  const { user, clearUser } = useAuthStore()
  const { unreadCount } = useNotificationStore()
  const { theme, toggleTheme } = useThemeStore()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    try {
      await logout()
    } catch {}
    clearUser()
    navigate('/auth/login')
  }

  const tier = user ? getRepTier(user.reputation?.score) : null

  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 h-full w-64 flex-col border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 transition-colors">
      {/* ── Brand Logo Header ──────────────────────────────────────── */}
      <div className="flex h-16 items-center justify-between px-5 border-b border-neutral-200 dark:border-neutral-800">
        <Link to="/dashboard" className="flex items-center">
          <Logo size="md" showBadge={true} />
        </Link>
      </div>

      {/* ── Main Navigation List ───────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6 scrollbar-thin">
        {/* PLATFORM SECTION */}
        <div>
          <div className="flex items-center gap-1.5 px-3 mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              Platform
            </p>
          </div>

          <ul className="space-y-1">
            {navItems.map(({ to, label, icon: Icon, badge }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition-all relative',
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-800/60 shadow-xs'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100/80 dark:hover:bg-neutral-900/70 border border-transparent'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={cn(
                          'h-4 w-4 shrink-0 transition-colors',
                          isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-neutral-400 dark:text-neutral-500'
                        )}
                      />
                      <span className="truncate">{label}</span>
                      {badge && unreadCount > 0 && (
                        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1.5 text-[10px] font-bold text-white shadow-xs">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* LEARNING SECTION */}
        <div>
          <div className="flex items-center gap-1.5 px-3 mb-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              Growth
            </p>
          </div>

          <ul className="space-y-1">
            {learningItems.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition-all relative',
                      isActive
                        ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/60 shadow-xs'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100/80 dark:hover:bg-neutral-900/70 border border-transparent'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={cn(
                          'h-4 w-4 shrink-0 transition-colors',
                          isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-400 dark:text-neutral-500'
                        )}
                      />
                      <span className="truncate">{label}</span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* ── Bottom Section: Preferences & User Profile Card ─────────── */}
      <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 space-y-2 bg-neutral-50/50 dark:bg-neutral-950">
        {/* Utilities: Settings & Theme Switch */}
        <div className="grid grid-cols-2 gap-1.5">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              cn(
                'flex items-center justify-center gap-2 rounded-xl py-2 px-2 text-xs font-bold transition-all border',
                isActive
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white border-neutral-300 dark:border-neutral-700 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-white dark:hover:bg-neutral-900 border-neutral-200 dark:border-neutral-800/80 bg-white/60 dark:bg-neutral-900/50'
              )
            }
          >
            <Settings className="h-3.5 w-3.5 text-neutral-500" />
            <span>Settings</span>
          </NavLink>

          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center justify-center gap-2 rounded-xl py-2 px-2 text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-white dark:hover:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 bg-white/60 dark:bg-neutral-900/50 transition-all shadow-xs"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'dark' ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5 text-neutral-600" />}
            <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
        </div>

        {/* Executive User Profile Card */}
        <div className="card-shine p-2.5 rounded-2xl flex items-center justify-between gap-2 shadow-sm">
          <Link
            to={`/profile/${user?._id || 'me'}`}
            className="flex items-center gap-2.5 min-w-0 flex-1 group"
            title="View my profile"
          >
            <div className="relative shrink-0">
              <Avatar
                src={user?.avatar?.url}
                name={user?.name}
                size="sm"
                className="group-hover:ring-2 group-hover:ring-indigo-500 transition-all"
              />
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-neutral-900" />
            </div>

            <div className="min-w-0 flex-1 text-left">
              <p className="text-xs font-extrabold text-neutral-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate leading-snug">
                {user?.name || 'Member'}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">
                  {tier?.label || 'New'}
                </span>
                <span className="text-[10px] text-neutral-400 font-semibold tabular-nums">
                  {user?.reputation?.score ?? 0} rep
                </span>
              </div>
            </div>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="h-8 w-8 rounded-xl flex items-center justify-center text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
