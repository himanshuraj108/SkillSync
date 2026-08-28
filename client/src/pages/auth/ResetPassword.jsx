import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { Lock, Eye, EyeOff, CheckCircle2, ArrowRight, XCircle, Mail, Check, X } from 'lucide-react'
import { z } from 'zod'
import { resetPassword } from '@/services/auth.service.js'
import { Button } from '@/components/ui/Button.jsx'
import { notify } from '@/lib/notify.jsx'
import { cn } from '@/lib/utils.js'

const schema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()

  const [showPw, setShowPw] = useState(false)
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  const [success, setSuccess] = useState(false)
  const [serverError, setServerError] = useState('')

  const isInvalidToken = !token || token === 'undefined' || token.length < 10

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
  })

  const currentPassword = watch('password', '')
  const currentConfirmPassword = watch('confirmPassword', '')

  const strength = useMemo(() => {
    let score = 0
    if (currentPassword.length >= 8) score++
    if (currentPassword.length >= 12) score++
    if (/[A-Z]/.test(currentPassword)) score++
    if (/[0-9]/.test(currentPassword)) score++
    if (/[^A-Za-z0-9]/.test(currentPassword)) score++

    const levels = [
      { label: 'Weak', color: 'bg-red-500', text: 'text-red-400' },
      { label: 'Fair', color: 'bg-orange-500', text: 'text-orange-400' },
      { label: 'Good', color: 'bg-amber-500', text: 'text-amber-400' },
      { label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-400' },
      { label: 'Very Strong', color: 'bg-indigo-500', text: 'text-indigo-400' },
    ]
    return { score, ...levels[Math.min(score, 4)] }
  }, [currentPassword])

  const passwordsMatch = currentPassword && currentConfirmPassword && currentPassword === currentConfirmPassword

  const onSubmit = async (data) => {
    if (isInvalidToken) {
      setServerError('No valid password reset token was provided.')
      return
    }

    try {
      setServerError('')
      await resetPassword(token, data.password)
      setSuccess(true)
      notify.success('Your password has been reset successfully.', 'Password Changed')
    } catch (err) {
      setServerError(err.message || 'The reset link is invalid or has expired.')
    }
  }

  if (isInvalidToken && !success) {
    return (
      <div className="w-full max-w-md mx-auto text-center py-4 space-y-5">
        <div className="h-16 w-16 rounded-3xl bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-700/80 flex items-center justify-center text-rose-500 mx-auto shadow-xl shadow-rose-950/30">
          <XCircle className="h-8 w-8 stroke-[2.2]" />
        </div>

        <div>
          <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            Invalid Reset Link
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mt-2 max-w-xs mx-auto">
            This password reset link is missing a valid security token or has already expired.
          </p>
        </div>

        <div className="pt-2 space-y-2">
          <Link to="/auth/forgot-password">
            <Button size="lg" className="w-full font-bold text-xs h-11 shadow-md">
              <Mail className="h-4 w-4 mr-1.5" />
              Request New Reset Link
            </Button>
          </Link>
          <Link to="/auth/login">
            <Button variant="outline" size="sm" className="w-full font-bold text-xs h-10">
              Back to sign in
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {!success ? (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
              Set new password
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1.5">
              Enter your new secure password for your SkillSwap account.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {serverError && (
              <div className="rounded-2xl border border-rose-200 dark:border-rose-800/60 bg-rose-50 dark:bg-rose-950/30 px-4 py-3">
                <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">{serverError}</p>
              </div>
            )}

            {/* Password input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                New password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type={showPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  {...register('password')}
                  className="w-full h-11 pl-10 pr-10 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs transition-colors"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-[11px] text-rose-500 font-medium">{errors.password.message}</p>}

              {/* Password Strength Meter */}
              {currentPassword && (
                <div className="pt-1.5 space-y-1">
                  <div className="flex gap-1 h-1.5">
                    {[0, 1, 2, 3, 4].map((idx) => (
                      <div
                        key={idx}
                        className={cn(
                          'flex-1 rounded-full transition-all duration-300',
                          idx < strength.score ? strength.color : 'bg-neutral-200 dark:bg-neutral-800'
                        )}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-neutral-500 font-medium">Strength:</span>
                    <span className={cn('font-bold', strength.text)}>{strength.label}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                Confirm new password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  type={showConfirmPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Repeat your new password"
                  {...register('confirmPassword')}
                  className={cn(
                    'w-full h-11 pl-10 pr-10 rounded-2xl border bg-white dark:bg-neutral-900 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs transition-colors',
                    currentConfirmPassword && passwordsMatch
                      ? 'border-emerald-500/60'
                      : currentConfirmPassword && !passwordsMatch
                      ? 'border-rose-500/60'
                      : 'border-neutral-200 dark:border-neutral-800'
                  )}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowConfirmPw(!showConfirmPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                >
                  {showConfirmPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-[11px] text-rose-500 font-medium">{errors.confirmPassword.message}</p>
              )}
              {currentConfirmPassword && !errors.confirmPassword && (
                <p className={cn('text-[11px] font-medium flex items-center gap-1', passwordsMatch ? 'text-emerald-500' : 'text-rose-500')}>
                  {passwordsMatch ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 font-bold text-xs shadow-lg shadow-indigo-600/30 mt-3"
              loading={isSubmitting}
              disabled={!passwordsMatch || strength.score < 2}
            >
              Reset Password
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>
          </form>
        </div>
      ) : (
        <div className="text-center py-4 space-y-5">
          <div className="h-16 w-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-700/80 flex items-center justify-center text-emerald-500 mx-auto shadow-xl shadow-emerald-950/30">
            <CheckCircle2 className="h-8 w-8 stroke-[2.2]" />
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
              Password Reset Complete
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed mt-2 max-w-sm mx-auto">
              Your password has been successfully updated. You can now sign in with your new credentials.
            </p>
          </div>

          <div className="pt-3">
            <Link to="/auth/login">
              <Button size="lg" className="w-full font-bold text-xs h-11 shadow-lg shadow-indigo-600/30">
                Sign in with new password
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
