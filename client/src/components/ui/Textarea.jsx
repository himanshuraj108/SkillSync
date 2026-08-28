import { forwardRef } from 'react'
import { cn } from '@/lib/utils.js'

const Textarea = forwardRef(({ label, error, helperText, className, autoResize, ...props }, ref) => {
  const handleInput = (e) => {
    if (autoResize) {
      e.target.style.height = 'auto'
      e.target.style.height = e.target.scrollHeight + 'px'
    }
    props.onInput?.(e)
  }

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-neutral-300">{label}</label>
      )}
      <textarea
        ref={ref}
        rows={4}
        className={cn(
          'w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2',
          'text-sm text-neutral-100 placeholder:text-neutral-500',
          'transition-colors resize-none',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-neutral-950 focus:border-transparent',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error && 'border-red-500 focus:ring-red-500',
          className
        )}
        onInput={handleInput}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      {helperText && !error && <p className="text-xs text-neutral-500">{helperText}</p>}
    </div>
  )
})
Textarea.displayName = 'Textarea'
export { Textarea }
