import { useState, useEffect } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { CheckCircle2, XCircle, RefreshCw, ArrowRight, ShieldCheck, Mail, ArrowLeftRight, Sparkles, Send } from 'lucide-react'
import { verifyEmail, resendVerification, getMe } from '@/services/auth.service.js'
import { useAuthStore } from '@/store/authStore.js'
import { Button } from '@/components/ui/Button.jsx'
import { notify } from '@/lib/notify.jsx'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const { user, setUser, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  const [status, setStatus] = useState('verifying') // 'verifying' | 'success' | 'error'
  const [message, setMessage] = useState('')
  const [resending, setResending] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    let timer
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((c) => c - 1), 1000)
    }
    return () => clearInterval(timer)
  }, [cooldown])

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('No verification token was provided in the link.')
      return
    }

    const performVerification = async () => {
      try {
        const res = await verifyEmail(token)
        try {
          const fresh = await getMe()
          const freshUser = fresh?.data || fresh
          if (freshUser) setUser(freshUser)
        } catch (_) {
          if (user) setUser({ ...user, is_email_verified: true })
        }
        setStatus('success')
        setMessage(res.message || 'Your email address has been verified successfully.')
        notify.success('Your account is now fully verified.', 'Email Verified')
      } catch (err) {
        // If token was already consumed but user is verified in DB
        try {
          const fresh = await getMe()
          const freshUser = fresh?.data || fresh
          if (freshUser?.is_email_verified) {
            setUser(freshUser)
            setStatus('success')
            setMessage('Your email address is already verified.')
            return
          }
        } catch (_) {}
        setStatus('error')
        setMessage(err.message || 'The verification link is invalid or has expired.')
      }
    }

    performVerification()
  }, [token])

  const handleResend = async () => {
    if (resending || cooldown > 0) return
    setResending(true)
    try {
      await resendVerification()
      setCooldown(60)
      notify.success('A new verification email has been delivered to your inbox.', 'Link Sent')
    } catch (err) {
      notify.error(err.message || 'Failed to resend verification email.', 'Resend Failed')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 flex flex-col items-center justify-center p-4 sm:p-6 selection:bg-indigo-500/30 font-sans">
      {/* Background radial subtle ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div className="w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl -translate-y-12" />
      </div>

      <div className="w-full max-w-lg z-10 space-y-6">
        {/* Brand Header */}
        <div className="flex items-center justify-center gap-2.5">
          <div className="h-9 w-9 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-base shadow-lg shadow-indigo-600/30">
            <ArrowLeftRight className="h-4 w-4" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-neutral-900 dark:text-white">
            SkillSwap
          </span>
        </div>

        {/* Status Card Container */}
        <div className="card-shine w-full rounded-3xl p-6 sm:p-10 text-center shadow-2xl border border-neutral-200/80 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/90 backdrop-blur-xl">

          {/* 1. VERIFYING STATE */}
          {status === 'verifying' && (
            <div className="py-6 space-y-5">
              <div className="h-16 w-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto shadow-md">
                <RefreshCw className="h-7 w-7 animate-spin" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
                  Verifying Your Email...
                </h2>
                <p className="text-xs sm:text-sm text-neutral-500 mt-1.5 max-w-xs mx-auto leading-relaxed">
                  Please hold on while we validate your security token with the network.
                </p>
              </div>
            </div>
          )}

          {/* 2. SUCCESS STATE */}
          {status === 'success' && (
            <div className="py-4 space-y-6">
              <div className="h-20 w-20 rounded-3xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-700/80 flex items-center justify-center text-emerald-500 mx-auto shadow-xl shadow-emerald-950/30">
                <ShieldCheck className="h-10 w-10 stroke-[2.2]" />
              </div>

              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Email Verified
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
                  You're Ready to Swap!
                </h2>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-sm mx-auto">
                  {message} Your account is fully unlocked for matching, in-app direct messaging, and live 1-on-1 video rooms.
                </p>
              </div>

              <div className="pt-2">
                <Link to="/dashboard">
                  <Button size="lg" className="w-full font-bold text-sm h-12 shadow-lg shadow-indigo-600/30">
                    <span>Continue to Dashboard</span>
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* 3. ERROR / EXPIRED STATE */}
          {status === 'error' && (
            <div className="py-4 space-y-6">
              <div className="h-20 w-20 rounded-3xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-700/80 flex items-center justify-center text-rose-500 mx-auto shadow-xl shadow-rose-950/30">
                <XCircle className="h-10 w-10 stroke-[2.2]" />
              </div>

              <div className="space-y-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                  Link Expired or Used
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
                  Verification Failed
                </h2>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-sm mx-auto">
                  {message}
                </p>
              </div>

              <div className="pt-2 space-y-3">
                {isAuthenticated && (
                  <Button
                    size="lg"
                    onClick={handleResend}
                    disabled={resending || cooldown > 0}
                    className="w-full font-bold text-sm h-12 shadow-lg shadow-indigo-600/30"
                  >
                    {resending ? (
                      <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Sending link...</>
                    ) : cooldown > 0 ? (
                      `Resend available in ${cooldown}s`
                    ) : (
                      <><Mail className="h-4 w-4 mr-2" /> Send New Verification Link</>
                    )}
                  </Button>
                )}

                <Link to="/dashboard">
                  <Button variant="outline" size="sm" className="w-full font-bold text-xs h-10">
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Footer Note */}
        <p className="text-[11px] text-center text-neutral-400 dark:text-neutral-500">
          Need assistance? Contact support or check your spam / promotions folder.
        </p>
      </div>
    </div>
  )
}
