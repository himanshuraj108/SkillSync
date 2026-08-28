import * as ProgressPrimitive from '@radix-ui/react-progress'
import { cn } from '@/lib/utils.js'

const heightMap = { sm: 'h-1', md: 'h-2', lg: 'h-3' }

function Progress({ value = 0, max = 100, size = 'md', showLabel = false, className }) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {showLabel && (
        <span className="text-xs text-neutral-500 self-end">{Math.round(percentage)}%</span>
      )}
      <ProgressPrimitive.Root
        className={cn(
          'relative overflow-hidden rounded-full bg-neutral-800 w-full',
          heightMap[size]
        )}
        value={percentage}
      >
        <ProgressPrimitive.Indicator
          className="h-full bg-indigo-600 transition-all duration-500 ease-out"
          style={{ transform: `translateX(-${100 - percentage}%)` }}
        />
      </ProgressPrimitive.Root>
    </div>
  )
}

export { Progress }
