import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const variants = {
  default: 'bg-indigo-600 text-white hover:bg-indigo-500 focus-visible:ring-indigo-500',
  secondary: 'bg-neutral-800 text-neutral-100 hover:bg-neutral-700 focus-visible:ring-neutral-500',
  outline: 'border border-neutral-700 text-neutral-100 hover:bg-neutral-800 hover:border-neutral-600 focus-visible:ring-neutral-500',
  ghost: 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 focus-visible:ring-neutral-500',
  destructive: 'bg-red-600 text-white hover:bg-red-500 focus-visible:ring-red-500',
  link: 'text-indigo-400 underline-offset-4 hover:underline hover:text-indigo-300 p-0 h-auto',
}

const sizes = {
  sm: 'h-8 px-3 text-xs rounded-md',
  md: 'h-9 px-4 text-sm rounded-md',
  lg: 'h-11 px-6 text-base rounded-lg',
  icon: 'h-9 w-9 rounded-md',
}

const Button = forwardRef(({ className, variant = 'default', size = 'md', loading = false, disabled, children, ...props }, ref) => {
  return (
    <motion.button
      ref={ref}
      whileTap={{ scale: 0.97 }}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950',
        'disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </motion.button>
  )
})
Button.displayName = 'Button'
export { Button }
