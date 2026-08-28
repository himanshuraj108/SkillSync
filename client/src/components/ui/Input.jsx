import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

const Input = forwardRef(({ className, label, error, helperText, startIcon: StartIcon, endIcon: EndIcon, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-neutral-300 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {StartIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
            <StartIcon className="h-4 w-4" />
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'flex h-10 w-full rounded-md border border-neutral-800 bg-neutral-900/50 px-3 py-2 text-sm text-neutral-100',
            'transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium',
            'placeholder:text-neutral-500',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500/50 focus-visible:ring-red-500/50 focus-visible:border-red-500',
            StartIcon && 'pl-10',
            EndIcon && 'pr-10',
            className
          )}
          {...props}
        />
        {EndIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500">
            <EndIcon className="h-4 w-4" />
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1.5 text-xs text-neutral-500">{helperText}</p>
      )}
    </div>
  )
})
Input.displayName = 'Input'

export { Input }
