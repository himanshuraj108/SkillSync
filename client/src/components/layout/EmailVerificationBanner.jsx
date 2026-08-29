import { useState, useEffect } from 'react'
import { AlertTriangle, Mail, RefreshCw, X, ShieldAlert, CheckCircle2 } from 'lucide-react'
import { useAuthStore } from '@/store/authStore.js'
import { resendVerification } from '@/services/auth.service.js'
import { notify } from '@/lib/notify.jsx'
import { Button } from '@/components/ui/Button.jsx'

export function EmailVerificationBanner() {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [dismissed, setDismissed] = useState(false)

  const [directVerifyUrl, setDirectVerifyUrl] = useState(null)

  useEffect(() => {
    let timer
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((c) => c - 1), 1000)
    }
    return () => clearInterval(timer)
  }, [cooldown])

  if (!user || user.is_email_verified || dismissed) {
    return null
  }

  const handleResend = async () => {
    if (cooldown > 0 || loading) return
    setLoading(true)
    try {
      await resendVerification()
      notify.success(
        `A verification email has been sent to ${user.email}. Please check your inbox or spam folder.`,
        'Verification Email Sent'
      )
      setCooldown(60)
    } catch (err) {
      notify.error(err.message || 'Failed to resend verification email.', 'Resend Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full bg-amber-500/10 dark:bg-amber-950/50 border-b border-amber-500/30 text-amber-900 dark:text-amber-200 px-4 py-3 transition-colors select-none">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 min-w-0 text-center md:text-left">
          <div className="h-8 w-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-500 shrink-0 shadow-xs hidden sm:flex">
            <ShieldAlert className="h-4 w-4" />
          </div>
          <p className="font-medium leading-relaxed">
            <span>Verify your email </span>
            <strong className="text-neutral-900 dark:text-amber-100 font-bold underline underline-offset-2 mx-1">{user.email}</strong>
            <span className="hidden sm:inline">to unlock video sessions, direct messaging, and matching.</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-center">
          <button
            type="button"
            onClick={handleResend}
            disabled={loading || cooldown > 0}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-neutral-950 hover:bg-amber-400 disabled:opacity-60 font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
          >
            {loading ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Mail className="h-3.5 w-3.5" />
            )}
            <span>
              {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend verification link'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="p-1.5 rounded-xl text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 transition-colors"
            title="Dismiss notice"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
