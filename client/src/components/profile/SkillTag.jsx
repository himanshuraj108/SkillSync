import { X } from 'lucide-react'
import { cn } from '@/lib/utils.js'
import { LEVEL_COLORS } from '@/lib/constants.js'

export function SkillTag({ skill, level, priority, onRemove, size = 'md' }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full border border-neutral-700 bg-neutral-800 text-neutral-300',
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
    )}>
      <span>{skill}</span>
      {level && (
        <span className={cn('rounded-full px-1.5 py-px text-[10px] font-medium', LEVEL_COLORS[level] || 'bg-neutral-700 text-neutral-400')}>
          {level}
        </span>
      )}
      {priority && (
        <span className="rounded-full px-1.5 py-px text-[10px] font-medium bg-neutral-700 text-neutral-400">
          {priority}
        </span>
      )}
      {onRemove && (
        <button onClick={onRemove} className="text-neutral-500 hover:text-neutral-200 transition-colors ml-0.5" type="button">
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  )
}
