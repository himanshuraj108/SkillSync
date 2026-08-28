import { cn } from '@/lib/utils.js'

const variantClasses = {
  default: 'bg-neutral-800 text-neutral-300 border border-neutral-700',
  success: 'bg-emerald-900/40 text-emerald-300 border border-emerald-700/50',
  warning: 'bg-amber-900/40 text-amber-300 border border-amber-700/50',
  destructive: 'bg-red-900/40 text-red-300 border border-red-700/50',
  indigo: 'bg-indigo-900/40 text-indigo-300 border border-indigo-700/50',
  outline: 'border border-neutral-700 text-neutral-400 bg-transparent',
}

export function Badge({ className, variant = 'default', children, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
