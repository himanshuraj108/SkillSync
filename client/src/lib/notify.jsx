import toast from 'react-hot-toast'
import { CheckCircle2, AlertCircle, Info, Sparkles, X, ShieldAlert } from 'lucide-react'

export const notify = {
  success: (message, title = 'Success') => {
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full card-shine shadow-2xl rounded-2xl pointer-events-auto flex items-center justify-between p-3.5 border border-emerald-500/30 gap-3`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-8 w-8 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-sm">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              {title && <p className="text-xs font-bold text-neutral-900 dark:text-white leading-tight">{title}</p>}
              <p className="text-xs text-neutral-600 dark:text-neutral-300 font-medium truncate">{message}</p>
            </div>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="h-6 w-6 flex items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40 transition-colors shrink-0"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
      { duration: 4000 }
    )
  },

  error: (message, title = 'Error') => {
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full card-shine shadow-2xl rounded-2xl pointer-events-auto flex items-center justify-between p-3.5 border border-rose-500/30 gap-3`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-8 w-8 rounded-xl bg-rose-950/80 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0 shadow-sm">
              <AlertCircle className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              {title && <p className="text-xs font-bold text-neutral-900 dark:text-white leading-tight">{title}</p>}
              <p className="text-xs text-neutral-600 dark:text-neutral-300 font-medium truncate">{message}</p>
            </div>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="h-6 w-6 flex items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40 transition-colors shrink-0"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
      { duration: 4000 }
    )
  },

  warning: (message, title = 'Warning') => {
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full card-shine shadow-2xl rounded-2xl pointer-events-auto flex items-center justify-between p-3.5 border border-amber-500/40 gap-3`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-8 w-8 rounded-xl bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-sm">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              {title && <p className="text-xs font-bold text-neutral-900 dark:text-white leading-tight">{title}</p>}
              <p className="text-xs text-neutral-600 dark:text-neutral-300 font-medium">{message}</p>
              <a
                href="/profile/me"
                className="text-[11px] text-amber-400 font-bold hover:text-amber-300 underline underline-offset-2 mt-0.5 inline-block"
              >
                Go to profile to verify
              </a>
            </div>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="h-6 w-6 flex items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40 transition-colors shrink-0"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
      { duration: 6000 }
    )
  },

  info: (message, title = 'SkillSync') => {
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full card-shine shadow-2xl rounded-2xl pointer-events-auto flex items-center justify-between p-3.5 border border-indigo-500/30 gap-3`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-8 w-8 rounded-xl bg-indigo-950/80 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0 shadow-sm">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              {title && <p className="text-xs font-bold text-neutral-900 dark:text-white leading-tight">{title}</p>}
              <p className="text-xs text-neutral-600 dark:text-neutral-300 font-medium truncate">{message}</p>
            </div>
          </div>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="h-6 w-6 flex items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40 transition-colors shrink-0"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
      { duration: 4000 }
    )
  },
}
