import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Compass, MessageSquare, Calendar, User } from 'lucide-react'
import { cn } from '@/lib/utils.js'
import { useNotificationStore } from '@/store/notificationStore.js'

const tabs = [
  { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { to: '/discover', label: 'Discover', icon: Compass },
  { to: '/chat', label: 'Chat', icon: MessageSquare, badge: true },
  { to: '/sessions', label: 'Sessions', icon: Calendar },
  { to: '/profile/me', label: 'Profile', icon: User },
]

export function MobileNav() {
  const { unreadCount } = useNotificationStore()

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 border-t lg:hidden shadow-lg"
      style={{ backgroundColor: 'rgb(var(--bg))', borderColor: 'rgb(var(--border))' }}
    >
      <div className="flex">
        {tabs.map(({ to, label, icon: Icon, badge }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors relative',
                isActive ? 'text-indigo-400' : 'text-neutral-600 hover:text-neutral-400'
              )
            }
          >
            <div className="relative">
              <Icon className="h-5 w-5" />
              {badge && unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[9px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
