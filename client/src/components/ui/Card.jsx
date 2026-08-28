import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

const Card = forwardRef(({ className, variant = 'default', padding = 'md', ...props }, ref) => {
  const variants = {
    default: 'bg-neutral-900 border border-neutral-800',
    bordered: 'border border-neutral-800 bg-transparent',
    ghost: 'border-none bg-transparent',
  }
  return (
    <div
      ref={ref}
      className={cn('rounded-xl text-neutral-100 shadow-sm', variants[variant], className)}
      {...props}
    />
  )
})
Card.displayName = 'Card'

const CardHeader = forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
))
CardHeader.displayName = 'CardHeader'

const CardTitle = forwardRef(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn('font-semibold leading-none tracking-tight text-neutral-100', className)} {...props} />
))
CardTitle.displayName = 'CardTitle'

const CardDescription = forwardRef(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm text-neutral-400', className)} {...props} />
))
CardDescription.displayName = 'CardDescription'

const CardContent = forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
))
CardContent.displayName = 'CardContent'

const CardFooter = forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />
))
CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
