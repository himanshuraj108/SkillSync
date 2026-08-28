import { AlertTriangle } from 'lucide-react'
import { Button } from './Button.jsx'

export function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-12 h-12 rounded-xl bg-red-900/30 border border-red-800/50 flex items-center justify-center mb-4">
        <AlertTriangle className="w-5 h-5 text-red-400" />
      </div>
      <h3 className="text-sm font-semibold text-neutral-300 mb-1">Failed to load</h3>
      <p className="text-sm text-neutral-500 max-w-xs mb-5">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
