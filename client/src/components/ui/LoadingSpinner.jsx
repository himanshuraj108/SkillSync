import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils.js'

export function LoadingSpinner({ className, label, fullPage = false }) {
  if (fullPage) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-neutral-950 z-50">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
        {label && <p className="mt-3 text-sm text-neutral-500">{label}</p>}
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col items-center justify-center py-8 gap-3', className)}>
      <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
      {label && <p className="text-sm text-neutral-500">{label}</p>}
    </div>
  )
}
