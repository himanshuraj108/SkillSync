import * as AvatarPrimitive from '@radix-ui/react-avatar'
import { cn, getInitials } from '@/lib/utils.js'

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-16 w-16 text-lg',
  xl: 'h-24 w-24 text-2xl',
}

function getColorFromName(name) {
  if (!name) return 'bg-neutral-700'
  const colors = [
    'bg-indigo-700', 'bg-violet-700', 'bg-blue-700', 'bg-emerald-700',
    'bg-amber-700', 'bg-rose-700', 'bg-teal-700', 'bg-cyan-700',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
}

export function Avatar({ src, name, size = 'md', online, className }) {
  const initials = getInitials(name)
  const colorClass = getColorFromName(name)

  let cleanSrc = src
  if (typeof window !== 'undefined' && window.location.protocol === 'https:' && src?.startsWith('http://localhost')) {
    const backendOrigin = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL?.replace('/api', '')
    if (backendOrigin && !backendOrigin.includes('localhost')) {
      cleanSrc = src.replace('http://localhost:5000', backendOrigin)
    } else {
      cleanSrc = null
    }
  }

  return (
    <div className="relative inline-flex">
      <AvatarPrimitive.Root
        className={cn(
          'relative inline-flex shrink-0 overflow-hidden rounded-full',
          sizeClasses[size],
          className
        )}
      >
        <AvatarPrimitive.Image
          src={cleanSrc}
          alt={name}
          className="aspect-square h-full w-full object-cover"
        />
        <AvatarPrimitive.Fallback
          className={cn('flex h-full w-full items-center justify-center font-semibold text-white', colorClass)}
          delayMs={300}
        >
          {initials}
        </AvatarPrimitive.Fallback>
      </AvatarPrimitive.Root>
      {online !== undefined && (
        <span
          className={cn(
            'absolute bottom-0 right-0 block rounded-full ring-2 ring-neutral-950',
            size === 'sm' ? 'h-2 w-2' : 'h-2.5 w-2.5',
            online ? 'bg-emerald-500' : 'bg-neutral-600'
          )}
        />
      )}
    </div>
  )
}
