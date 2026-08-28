import { cn } from '@/lib/utils.js'

export function LogoIcon({ className = 'h-8 w-8' }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0 select-none shadow-md shadow-indigo-600/25 rounded-xl', className)}
    >
      <defs>
        <linearGradient id="logo-tile-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4338ca" />
          <stop offset="100%" stopColor="#6d28d9" />
        </linearGradient>
      </defs>

      {/* Squircle Base Tile */}
      <rect width="32" height="32" rx="9" fill="url(#logo-tile-bg)" />

      {/* Laptop / Computer Monitor Window Frame */}
      <rect x="3.5" y="5" width="25" height="17.5" rx="3" fill="#090d16" stroke="#ffffff" strokeWidth="1.3" />

      {/* LEFT PEER VIDEO CALL TILE */}
      <rect x="4.8" y="6.3" width="10.8" height="14.8" rx="2" fill="#0f2038" />
      {/* Left User (Head & Torso) */}
      <circle cx="10.2" cy="11" r="2.3" fill="#38bdf8" />
      <path d="M 6.2 19.5 C 6.2 15.8 7.8 14.6 10.2 14.6 C 12.6 14.6 14.2 15.8 14.2 19.5 Z" fill="#38bdf8" />

      {/* RIGHT PEER VIDEO CALL TILE */}
      <rect x="16.4" y="6.3" width="10.8" height="14.8" rx="2" fill="#24123a" />
      {/* Right User (Head & Torso) */}
      <circle cx="21.8" cy="11" r="2.3" fill="#c084fc" />
      <path d="M 17.8 19.5 C 17.8 15.8 19.4 14.6 21.8 14.6 C 24.2 14.6 25.8 15.8 25.8 19.5 Z" fill="#c084fc" />

      {/* Laptop Keyboard Base */}
      <path d="M 6.5 24 H 25.5 L 26.5 26.2 C 26.7 26.6 26.4 27 25.9 27 H 6.1 C 5.6 27 5.3 26.6 5.5 26.2 Z" fill="#ffffff" />

      {/* Live Meeting Active Indicator Core */}
      <circle cx="16" cy="24.5" r="1.1" fill="#10b981" />
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
