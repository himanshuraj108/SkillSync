import { cn } from '@/lib/utils.js'

function Skeleton({ className, ...props }) {
  return (
    <div className={cn('animate-pulse rounded-md bg-neutral-800', className)} {...props} />
  )
}

function SkeletonText({ lines = 3, className }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn('h-4', i === lines - 1 ? 'w-3/4' : 'w-full')}
        />
      ))}
    </div>
  )
}

function SkeletonAvatar({ size = 'md' }) {
  const sizeMap = { sm: 'h-8 w-8', md: 'h-10 w-10', lg: 'h-16 w-16', xl: 'h-24 w-24' }
  return <Skeleton className={cn('rounded-full', sizeMap[size])} />
}

function SkeletonCard({ className }) {
  return (
    <div className={cn('rounded-xl border border-neutral-800 bg-neutral-900 p-5', className)}>
      <div className="flex items-start gap-3 mb-4">
        <SkeletonAvatar />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <SkeletonText lines={3} />
    </div>
  )
}

export { Skeleton, SkeletonText, SkeletonAvatar, SkeletonCard }
