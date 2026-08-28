import { cn } from '@/lib/utils.js'

export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
      {Icon && (
        <div className="w-12 h-12 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center mb-4">
          <Icon className="w-5 h-5 text-neutral-500" />
        </div>
      )}
      <h3 className="text-sm font-semibold text-neutral-300 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-neutral-500 max-w-xs mb-5">{description}</p>
      )}
      {action}
    </div>
  )
}
