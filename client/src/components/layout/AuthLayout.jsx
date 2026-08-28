import { Link, Outlet } from 'react-router-dom'
import { Sparkles, Moon, Sun, ArrowRight, ArrowLeft } from 'lucide-react'
import { useThemeStore } from '@/store/themeStore.js'
import { Logo } from '@/components/ui/Logo.jsx'

export function AuthLayout({ children }) {
  const content = children || <Outlet />
  const { theme, toggleTheme } = useThemeStore()

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors font-sans selection:bg-indigo-500/30">
      {/* ── Left Executive Hero Branding Column (Desktop Only) ───── */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[540px] flex-col justify-between p-10 xl:p-12 border-r border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-950/90 relative overflow-hidden shrink-0">
        {/* Subtle Background Glow */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <Link to="/" className="flex items-center relative z-10">
          <Logo size="md" showBadge={true} />
        </Link>

        {/* Main Content & Interactive Match Preview */}
        <div className="my-auto py-8 space-y-6 relative z-10">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
              Peer Knowledge Network
            </span>
            <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-[1.15] mt-1 mb-3">
              Exchange skills,<br />
              <span className="text-indigo-600 dark:text-indigo-400">not money.</span>
            </h2>
            <p className="text-xs xl:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-sm">
              Teach what you know. Learn what you need. Zero fees, zero subscriptions — pure mutual growth.
            </p>
          </div>

          {/* Mini Live Match Card Preview */}
          <div className="card-shine p-4 rounded-2xl shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/60 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-xs">
                  AS
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-900 dark:text-white leading-none">Arjun S.</p>
                  <p className="text-[10px] text-neutral-500">Student</p>
                </div>
              </div>

              <div className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-[10px] font-black text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                94% Match
              </div>

              <div className="flex items-center gap-2 text-right">
                <div>
                  <p className="text-xs font-bold text-neutral-900 dark:text-white leading-none">Priya M.</p>
                  <p className="text-[10px] text-neutral-500">Educator</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/60 flex items-center justify-center text-purple-700 dark:text-purple-300 font-bold text-xs">
                  PM
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-neutral-50/70 dark:bg-neutral-950/80 border border-neutral-200 dark:border-neutral-800/80 flex items-center justify-between text-xs">
              <span className="font-bold text-indigo-600 dark:text-indigo-400">Java Backend</span>
              <ArrowRight className="h-3.5 w-3.5 text-neutral-400 mx-2 shrink-0" />
              <span className="font-bold text-neutral-700 dark:text-neutral-200">Figma UI/UX</span>
            </div>
          </div>

          {/* 3 Step Guide */}
          <div className="space-y-3 pt-2">
            {[
              { step: '01', title: 'Declare your skills', desc: 'List what you can teach and want to learn' },
              { step: '02', title: 'Get matched by AI', desc: 'Match with compatible peers based on skill overlap' },
              { step: '03', title: 'Exchange sessions', desc: 'Book 1-on-1 live video swaps and level up' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex items-start gap-3">
                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 w-6 shrink-0 pt-0.5 tabular-nums">
                  {step}
                </span>
                <div>
                  <p className="text-xs font-bold text-neutral-900 dark:text-white leading-snug">{title}</p>
                  <p className="text-[11px] text-neutral-500 leading-tight">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <p className="text-[11px] text-neutral-500 font-medium relative z-10">
          Open Education for University Students & Professors
        </p>
      </div>

      {/* ── Right Content Form Area ──────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 sm:px-8 py-12 relative overflow-y-auto">
        {/* Top Right Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="absolute top-5 right-5 p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors shadow-xs"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-neutral-600" />}
        </button>

        {/* Form Container Card */}
        <div className="w-full max-w-md card-shine p-6 sm:p-9 rounded-3xl shadow-2xl relative z-10 my-auto">
          {/* Mobile Logo */}
          <div className="flex items-center mb-6 lg:hidden">
            <Logo size="sm" />
          </div>

          {content}
        </div>
      </div>
    </div>
  )
}
