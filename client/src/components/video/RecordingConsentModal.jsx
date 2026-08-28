import { useState } from 'react'
import { Video, ShieldCheck, Clock, Check, X, Lock } from 'lucide-react'
import { Button } from '@/components/ui/Button.jsx'

export function RecordingConsentModal({ isOpen, onSelect, partnerName = 'Peer' }) {
  const [submitting, setSubmitting] = useState(false)

  if (!isOpen) return null

  const handleChoice = async (consent) => {
    setSubmitting(true)
    try {
      await onSelect(consent)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade">
      <div className="w-full max-w-md rounded-3xl border border-neutral-800 bg-neutral-900/95 p-6 sm:p-7 shadow-2xl space-y-6 text-neutral-100 relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 shadow-sm">
            <Video className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-100">
              7-Day Session Recording
            </h3>
            <p className="text-xs text-neutral-400">
              Personal preference for this live exchange
            </p>
          </div>
        </div>

        {/* Informational Policy Box */}
        <div className="p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800/80 space-y-2.5 text-xs text-neutral-300">
          <p className="leading-relaxed">
            Would you like a private recording of this session saved to your account for <strong className="text-indigo-400">7 days</strong> to review and study?
          </p>

          <div className="space-y-2 pt-2 border-t border-neutral-800/80 text-[11px] text-neutral-400">
            <div className="flex items-start gap-2">
              <Lock className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-neutral-200">Personal Choice:</strong> Your decision is private. If you opt in and {partnerName} opts out, the recording will be stored <strong className="text-neutral-200">only</strong> in your account.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong className="text-neutral-200">7-Day Auto Purge:</strong> The recording will automatically expire and delete after 7 days.
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
          <Button
            onClick={() => handleChoice(true)}
            loading={submitting}
            className="w-full sm:flex-1 font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20"
          >
            <Check className="h-4 w-4 mr-1.5" /> Save to My Account
          </Button>
          <Button
            onClick={() => handleChoice(false)}
            disabled={submitting}
            variant="outline"
            className="w-full sm:w-auto font-medium text-xs border-neutral-700 hover:bg-neutral-800 text-neutral-300"
          >
            <X className="h-4 w-4 mr-1 text-neutral-400" /> Don't Save
          </Button>
        </div>
      </div>
    </div>
  )
}

export default RecordingConsentModal
