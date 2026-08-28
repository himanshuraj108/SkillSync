import { cn } from '@/lib/utils.js'

export function LogoIcon({ className = 'h-8 w-8' }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0 select-none shadow-md shadow-indigo-600/20 rounded-xl', className)}
    >
      <defs>
        <linearGradient id="logo-bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        <linearGradient id="logo-user-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e0e7ff" />
        </linearGradient>
      </defs>

      {/* Rounded Squircle Tile */}
      <rect width="32" height="32" rx="9" fill="url(#logo-bg-grad)" />

      {/* Left User (Peer 1) */}
      <circle cx="6.5" cy="11.5" r="2.5" fill="url(#logo-user-grad)" />
      <path
        d="M2.5 22c0-2.4 1.8-4.2 4-4.2h1.5c.8 0 1.5.3 2.1.8"
        stroke="url(#logo-user-grad)"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Center PC / Laptop Meeting Screen */}
      <rect
        x="11"
        y="9.5"
        width="10"
        height="7.5"
        rx="1.5"
        fill="#0f172a"
        stroke="url(#logo-user-grad)"
        strokeWidth="1.6"
      />
      {/* Live 2-Way Meeting Presence on Screen */}
      <circle cx="14" cy="13.2" r="1" fill="#38bdf8" />
      <circle cx="18" cy="13.2" r="1" fill="#a855f7" />
      <path d="M15.4 13.2h1.2" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" />
      {/* Laptop Keyboard Base */}
      <path
        d="M9.5 18h13c.4 0 .7.3.6.7l-.3.8c-.1.3-.4.5-.7.5H9.9c-.3 0-.6-.2-.7-.5l-.3-.8c-.1-.4.2-.7.6-.7z"
        fill="url(#logo-user-grad)"
      />

      {/* Right User (Peer 2) */}
      <circle cx="25.5" cy="11.5" r="2.5" fill="url(#logo-user-grad)" />
      <path
        d="M29.5 22c0-2.4-1.8-4.2-4-4.2h-1.5c-.8 0-1.5.3-2.1.8"
        stroke="url(#logo-user-grad)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function Logo({ size = 'md', showBadge = false, className = '' }) {
  const sizeMap = {
    sm: { icon: 'h-7 w-7', text: 'text-sm', badge: 'text-[9px]' },
    md: { icon: 'h-8 w-8', text: 'text-base', badge: 'text-[10px]' },
    lg: { icon: 'h-10 w-10', text: 'text-xl', badge: 'text-xs' },
  }

  const current = sizeMap[size] || sizeMap.md

  return (
    <div className={cn('flex items-center gap-2.5 font-sans', className)}>
      <LogoIcon className={current.icon} />
      <div className="flex items-center gap-1.5">
        <span className={cn('font-extrabold tracking-tight text-neutral-900 dark:text-white', current.text)}>
          SkillSync
        </span>
        {showBadge && (
          <span
            className={cn(
              'font-black uppercase tracking-wider px-1.5 py-0.2 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60',
              current.badge
            )}
          >
            P2P
          </span>
        )}
      </div>
    </div>
  )
}

export default Logo
