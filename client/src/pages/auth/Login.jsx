import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react'
import { z } from 'zod'
import { login } from '@/services/auth.service.js'
import { useAuthStore } from '@/store/authStore.js'
import { Button } from '@/components/ui/Button.jsx'

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export default function Login() {
  const navigate = useNavigate()
  const { setUser } = useAuthStore()
  const [showPw, setShowPw] = useState(false)
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
      const res = await login(data.email, data.password)
      const userData = res.data || res.user || res
      setUser(userData)
      navigate('/dashboard')
    } catch (err) {
      setServerError(err.message || 'Invalid email or password. Please try again.')
    }
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
          Welcome back
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 mt-1.5">
          Sign in to your SkillSync account to manage peer exchanges
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {serverError && (
          <div className="rounded-xl border border-rose-200 dark:border-rose-800/60 bg-rose-50 dark:bg-rose-950/30 px-4 py-3">
            <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">{serverError}</p>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="you@college.edu"
              {...register('email')}
              className="w-full h-10 pl-9 pr-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs transition-colors"
            />
          </div>
          {errors.email && <p className="text-[11px] text-rose-500 font-medium">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
              Password
            </label>
            <Link
              to="/auth/forgot-password"
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type={showPw ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              {...register('password')}
              className="w-full h-10 pl-9 pr-10 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs transition-colors"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-[11px] text-rose-500 font-medium">{errors.password.message}</p>}
        </div>

        <Button type="submit" className="w-full h-10 font-bold text-xs shadow-md mt-2" loading={isSubmitting}>
          Sign in
          <ArrowRight className="h-4 w-4 ml-1.5" />
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-neutral-500 font-medium">
        Don't have an account?{' '}
        <Link to="/auth/register" className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold">
          Create account free
        </Link>
      </p>
    </div>
  )
}
