import { useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Check, Plus, X, Eye, EyeOff } from 'lucide-react'
import { register as registerApi, checkEmailAvailability } from '@/services/auth.service.js'
import { useAuthStore } from '@/store/authStore.js'
import { Button } from '@/components/ui/Button.jsx'
import { Input } from '@/components/ui/Input.jsx'
import { SKILL_LEVELS, DAYS_OF_WEEK } from '@/lib/constants.js'
import { cn } from '@/lib/utils.js'

const PRIORITIES = ['low', 'medium', 'high']

// ── Password strength scorer ─────────────────────────────────────────────
function getStrength(password) {
  if (!password) return { score: 0, label: '', color: '' }
  let score = 0
  if (password.length >= 8)  score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500',    text: 'text-red-400'    }
  if (score <= 2) return { score: 2, label: 'Fair', color: 'bg-orange-400',  text: 'text-orange-400' }
  if (score <= 3) return { score: 3, label: 'Good', color: 'bg-yellow-400',  text: 'text-yellow-400' }
  if (score <= 4) return { score: 4, label: 'Strong', color: 'bg-green-400', text: 'text-green-400'  }
  return               { score: 5, label: 'Very Strong', color: 'bg-emerald-400', text: 'text-emerald-400' }
}

export default function Register() {
  const navigate = useNavigate()
  const { setUser } = useAuthStore()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')

  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'student', institution: '',
    skills_teach: [], skills_learn: [], availability: [],
  })
  const [teachInput, setTeachInput] = useState({ skill: '', level: 'intermediate' })
  const [learnInput, setLearnInput] = useState({ skill: '', priority: 'high' })
  const [avail, setAvail] = useState({})

  const strength = useMemo(() => getStrength(form.password), [form.password])
  const passwordsMatch = confirmPassword.length > 0 && form.password === confirmPassword

  const upd = (obj) => setForm(p => ({ ...p, ...obj }))

  const addTeach = () => {
    if (!teachInput.skill.trim()) return
    upd({ skills_teach: [...form.skills_teach, { skill: teachInput.skill.trim(), level: teachInput.level }] })
    setTeachInput(p => ({ ...p, skill: '' }))
  }

  const addLearn = () => {
    if (!learnInput.skill.trim()) return
    upd({ skills_learn: [...form.skills_learn, { skill: learnInput.skill.trim(), priority: learnInput.priority }] })
    setLearnInput(p => ({ ...p, skill: '' }))
  }

  const toggleDay = (day) => {
    setAvail(p => {
      if (p[day]) {
        const n = { ...p }; delete n[day]; return n
      }
      return { ...p, [day]: { start: '09:00', end: '18:00' } }
    })
  }

  const handleStep1Next = async () => {
    setError('')
    const trimmedEmail = (form.email || '').trim().toLowerCase()
    if (!form.name.trim()) {
      setError('Please enter your full name.')
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setError('Please enter a valid email address.')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (form.password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const res = await checkEmailAvailability(trimmedEmail)
      if (res && res.available === false) {
        setError('This email is already registered. Please log in instead or use another email.')
        setLoading(false)
        return
      }
      setStep(2)
    } catch (_) {
      // Allow proceeding if network check fails
      setStep(2)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    setLoading(true); setError('')
    try {
      const availability = Object.entries(avail).map(([day, times]) => ({ day, ...times }))
      const res = await registerApi({ ...form, email: form.email.trim().toLowerCase(), availability })
      const userData = res?.data || res?.user || res
      setUser(userData)
      navigate('/dashboard')
    } catch (err) {
      const msg = err.message || 'Registration failed. Please try again.'
      setError(msg)
      if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('already exist')) {
        setStep(1)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <div className="flex gap-1.5 mb-6">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className={cn(
                'h-0.5 flex-1 rounded-full transition-all duration-300',
                step >= i ? 'bg-indigo-500' : 'bg-neutral-800'
              )}
            />
          ))}
        </div>
        <p className="text-xs font-medium text-neutral-600 uppercase tracking-widest mb-1">
          Step {step} of 3
        </p>
        <h1 className="text-2xl font-bold text-neutral-100 tracking-tight">
          {step === 1 && 'Create your account'}
          {step === 2 && 'Declare your skills'}
          {step === 3 && 'Set your availability'}
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          {step === 1 && 'Basic information to get started'}
          {step === 2 && 'What you can teach and want to learn'}
          {step === 3 && 'When you are available for sessions'}
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-800/60 bg-red-900/20 px-4 py-3.5 flex items-center justify-between gap-3">
          <p className="text-xs sm:text-sm text-red-300 leading-relaxed">{error}</p>
          {(error.toLowerCase().includes('already registered') || error.toLowerCase().includes('log in')) && (
            <Link
              to={`/auth/login?email=${encodeURIComponent(form.email.trim())}`}
              className="shrink-0 text-xs font-bold text-indigo-300 hover:text-white bg-indigo-950/80 border border-indigo-600/60 px-3 py-1.5 rounded-lg transition-colors"
            >
              Log in →
            </Link>
          )}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <Input
            label="Full name"
            placeholder="Arjun Singh"
            autoFocus
            value={form.name}
            onChange={e => upd({ name: e.target.value })}
          />
          <Input
            label="Email"
            type="email"
            placeholder="you@college.edu"
            value={form.email}
            onChange={e => upd({ email: e.target.value })}
          />

          {/* Password with strength meter */}
          <div className="space-y-2">
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min 8 characters"
                value={form.password}
                onChange={e => upd({ password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-[34px] text-neutral-500 hover:text-neutral-300 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Strength segments */}
            {form.password.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div
                      key={i}
                      className={cn(
                        'h-1 flex-1 rounded-full transition-all duration-300',
                        i <= strength.score ? strength.color : 'bg-neutral-800'
                      )}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className={cn('text-xs font-semibold', strength.text)}>
                    {strength.label}
                  </span>
                  <span className="text-[11px] text-neutral-600">
                    {strength.score < 3 && 'Add uppercase, numbers & symbols'}
                    {strength.score === 3 && 'Add symbols for stronger password'}
                    {strength.score >= 4 && 'Great password'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <div className="relative">
              <Input
                label="Confirm password"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(v => !v)}
                className="absolute right-3 top-[34px] text-neutral-500 hover:text-neutral-300 transition-colors"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {confirmPassword.length > 0 && (
              <p className={cn(
                'text-xs font-medium flex items-center gap-1.5 px-0.5',
                passwordsMatch ? 'text-emerald-400' : 'text-red-400'
              )}>
                {passwordsMatch
                  ? <><Check className="h-3.5 w-3.5" /> Passwords match</>
                  : <><X className="h-3.5 w-3.5" /> Passwords do not match</>
                }
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-neutral-300 block mb-2">I am a</label>
            <div className="grid grid-cols-2 gap-3">
              {['student', 'professor'].map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => upd({ role })}
                  className={cn(
                    'py-2.5 rounded-lg border text-sm font-medium capitalize transition-all',
                    form.role === role
                      ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                      : 'border-neutral-800 text-neutral-500 hover:border-neutral-700 hover:text-neutral-300'
                  )}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Institution"
            placeholder="IIT Delhi, BITS Pilani..."
            value={form.institution}
            onChange={e => upd({ institution: e.target.value })}
            helperText="Optional but helps with matching"
          />

          <Button
            className="w-full mt-2 font-bold"
            onClick={handleStep1Next}
            loading={loading}
            disabled={
              loading ||
              !form.name.trim() ||
              !form.email.trim() ||
              form.password.length < 8 ||
              strength.score < 2 ||
              !passwordsMatch
            }
          >
            Continue to Skills →
          </Button>

          <p className="text-center text-sm text-neutral-600">
            Already have an account?{' '}
            <Link to="/auth/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      )}


      {step === 2 && (
        <div className="space-y-6">
          <div>
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">I can teach</p>
            <div className="flex gap-2 mb-3">
              <input
                className="flex-1 h-9 rounded-md border border-neutral-700 bg-neutral-900 px-3 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-neutral-950"
                placeholder="e.g. Java, SQL, React..."
                value={teachInput.skill}
                onChange={e => setTeachInput(p => ({ ...p, skill: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && addTeach()}
              />
              <select
                className="h-9 rounded-md border border-neutral-700 bg-neutral-900 px-2 text-sm text-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={teachInput.level}
                onChange={e => setTeachInput(p => ({ ...p, level: e.target.value }))}
              >
                {SKILL_LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
              <Button size="sm" onClick={addTeach} type="button">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 min-h-[36px]">
              {form.skills_teach.map((s, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 rounded-full border border-neutral-700 bg-neutral-800 px-3 py-1 text-sm text-neutral-300">
                  {s.skill}
                  <span className="text-[10px] bg-indigo-900/50 text-indigo-300 rounded-full px-1.5 py-px">{s.level}</span>
                  <button onClick={() => upd({ skills_teach: form.skills_teach.filter((_, j) => j !== i) })} className="text-neutral-600 hover:text-neutral-300 ml-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {form.skills_teach.length === 0 && (
                <p className="text-xs text-neutral-700">Add at least one skill you can teach</p>
              )}
            </div>
          </div>

          <div className="border-t border-neutral-800" />

          <div>
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">I want to learn</p>
            <div className="flex gap-2 mb-3">
              <input
                className="flex-1 h-9 rounded-md border border-neutral-700 bg-neutral-900 px-3 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-neutral-950"
                placeholder="e.g. Figma, Python, UI/UX..."
                value={learnInput.skill}
                onChange={e => setLearnInput(p => ({ ...p, skill: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && addLearn()}
              />
              <select
                className="h-9 rounded-md border border-neutral-700 bg-neutral-900 px-2 text-sm text-neutral-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={learnInput.priority}
                onChange={e => setLearnInput(p => ({ ...p, priority: e.target.value }))}
              >
                {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)} priority</option>)}
              </select>
              <Button size="sm" onClick={addLearn} type="button">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 min-h-[36px]">
              {form.skills_learn.map((s, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 rounded-full border border-neutral-700 bg-neutral-800 px-3 py-1 text-sm text-neutral-300">
                  {s.skill}
                  <span className={cn(
                    'text-[10px] rounded-full px-1.5 py-px',
                    s.priority === 'high' ? 'bg-rose-900/50 text-rose-300' :
                    s.priority === 'medium' ? 'bg-amber-900/50 text-amber-300' :
                    'bg-neutral-700 text-neutral-400'
                  )}>{s.priority}</span>
                  <button onClick={() => upd({ skills_learn: form.skills_learn.filter((_, j) => j !== i) })} className="text-neutral-600 hover:text-neutral-300 ml-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {form.skills_learn.length === 0 && (
                <p className="text-xs text-neutral-700">Add at least one skill you want to learn</p>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
            <Button
              onClick={() => setStep(3)}
              className="flex-1"
              disabled={form.skills_teach.length === 0 || form.skills_learn.length === 0}
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-5">
          <p className="text-sm text-neutral-500">
            Select days you are available for sessions. You can update this anytime in your profile.
          </p>

          <div className="space-y-2">
            {DAYS_OF_WEEK.map(day => (
              <div key={day} className={cn(
                'rounded-lg border transition-colors',
                avail[day] ? 'border-indigo-700/60 bg-indigo-900/10' : 'border-neutral-800 bg-neutral-900/30'
              )}>
                <div className="flex items-center gap-3 px-4 py-3">
                  <button
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={cn(
                      'flex h-5 w-5 items-center justify-center rounded border-2 transition-all shrink-0',
                      avail[day]
                        ? 'border-indigo-500 bg-indigo-600'
                        : 'border-neutral-700 bg-transparent hover:border-neutral-500'
                    )}
                  >
                    {avail[day] && <Check className="h-3 w-3 text-white" />}
                  </button>
                  <span className="text-sm font-medium text-neutral-300 w-10">{day}</span>
                  {avail[day] && (
                    <div className="flex items-center gap-2 ml-auto">
                      <input
                        type="time"
                        value={avail[day].start}
                        onChange={e => setAvail(p => ({ ...p, [day]: { ...p[day], start: e.target.value } }))}
                        className="h-7 rounded border border-neutral-700 bg-neutral-800 px-2 text-xs text-neutral-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <span className="text-xs text-neutral-600">to</span>
                      <input
                        type="time"
                        value={avail[day].end}
                        onChange={e => setAvail(p => ({ ...p, [day]: { ...p[day], end: e.target.value } }))}
                        className="h-7 rounded border border-neutral-700 bg-neutral-800 px-2 text-xs text-neutral-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setStep(2)} className="flex-1" disabled={loading}>Back</Button>
            <Button onClick={handleSubmit} className="flex-1" loading={loading}>
              Create account
            </Button>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full text-center text-xs text-neutral-600 hover:text-neutral-500 transition-colors"
            disabled={loading}
          >
            Skip for now
          </button>
        </div>
      )}
    </div>
  )
}
