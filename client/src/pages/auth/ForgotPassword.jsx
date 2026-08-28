import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, ArrowRight, CheckCircle2, KeyRound, Sparkles, RefreshCw } from 'lucide-react'
import { z } from 'zod'
import { forgotPassword } from '@/services/auth.service.js'
import { Button } from '@/components/ui/Button.jsx'
import { notify } from '@/lib/notify.jsx'

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

export default function ForgotPassword() {
  const [submitted, setSubmitted] = useState(false)
  const [targetEmail, setTargetEmail] = useState('')
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data) => {
    try {
      setServerError('')
      await forgotPassword(data.email)
      setTargetEmail(data.email)
      setSubmitted(true)
      notify.success('Password reset instructions sent to your email.', 'Email Sent')
    } catch (err) {
      setServerError(err.message || 'Failed to send reset email. Please try again.')
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {!submitted ? (
        <div className="space-y-6">
          <div>
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 shadow-sm">
              <KeyRound className="h-6 w-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
              Forgot password?
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1.5 leading-relaxed">
              Enter your verified account email address and we'll send you a secure link to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {serverError && (
              <div className="rounded-2xl border border-rose-200 dark:border-rose-800/60 bg-rose-50 dark:bg-rose-950/30 px-4 py-3">
                <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">{serverError}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type="email"
                  autoComplete="email"
                  autoFocus
                  placeholder="name@university.edu"
                  {...register('email')}
                  className="w-full h-11 pl-10 pr-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs transition-colors"
                />
              </div>
              {errors.email && <p className="text-[11px] text-rose-500 font-medium">{errors.email.message}</p>}
            </div>

            <Button type="submit" className="w-full h-11 font-bold text-xs shadow-lg shadow-indigo-600/30 mt-2" loading={isSubmitting}>
              Send Reset Link
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </form>

          <div className="text-center pt-2">
            <Link
              to="/auth/login"
              className="inline-flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white font-semibold transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to sign in
            </Link>
          </div>
        </div>
      ) : (
        <div className="text-center py-4 space-y-5">
          <div className="h-16 w-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-700/80 flex items-center justify-center text-emerald-500 mx-auto shadow-xl shadow-emerald-950/30">
            <CheckCircle2 className="h-8 w-8 stroke-[2.2]" />
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
              Check your inbox
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed mt-2 max-w-sm mx-auto">
              We've dispatched a password reset link to <strong className="text-neutral-900 dark:text-white underline">{targetEmail}</strong>.
            </p>
          </div>

          <div className="pt-3 space-y-3">
            <Link to="/auth/login">
              <Button size="lg" className="w-full font-bold text-xs h-11 shadow-md">
                Return to Sign In
              </Button>
            </Link>

            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
            >
              Didn't receive the email? Try again
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
