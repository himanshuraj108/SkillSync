import { Link } from 'react-router-dom'
import { ArrowLeft, Compass, LayoutDashboard, Calendar, Sparkles, Home } from 'lucide-react'
import { Button } from '@/components/ui/Button.jsx'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 flex flex-col items-center justify-center px-6 py-12 selection:bg-indigo-500/30">
      <div className="card-shine max-w-lg w-full rounded-3xl p-8 sm:p-10 text-center shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="flex items-center justify-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md">
            ⇄
          </div>
          <span className="font-extrabold text-base tracking-tight text-neutral-900 dark:text-white">
            SkillSync
          </span>
        </div>

        {/* 404 Visual Indicator */}
        <div className="py-2">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-black bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 uppercase tracking-widest mb-3">
            Error 404
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            Page not found
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 mt-2 max-w-sm mx-auto leading-relaxed">
            The page you requested doesn't exist, was moved, or requires different access permissions.
          </p>
        </div>

        {/* Quick Shortcut Buttons Grid */}
        <div className="grid grid-cols-2 gap-2 text-left pt-2 border-t border-neutral-200 dark:border-neutral-800">
          <Link
            to="/dashboard"
            className="p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/60 hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 transition-all group"
          >
            <LayoutDashboard className="h-4 w-4 text-indigo-500 mb-1.5" />
            <p className="text-xs font-bold text-neutral-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
              Dashboard
            </p>
            <p className="text-[10px] text-neutral-500">Your exchange hub</p>
          </Link>

          <Link
            to="/discover"
            className="p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/60 hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 transition-all group"
          >
            <Compass className="h-4 w-4 text-emerald-500 mb-1.5" />
            <p className="text-xs font-bold text-neutral-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
              Discover
            </p>
            <p className="text-[10px] text-neutral-500">Find swap peers</p>
          </Link>

          <Link
            to="/sessions"
            className="p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/60 hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 transition-all group"
          >
            <Calendar className="h-4 w-4 text-amber-500 mb-1.5" />
            <p className="text-xs font-bold text-neutral-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400">
              Sessions
            </p>
            <p className="text-[10px] text-neutral-500">Manage calendar</p>
          </Link>

          <Link
            to="/"
            className="p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/60 hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 transition-all group"
          >
            <Home className="h-4 w-4 text-purple-500 mb-1.5" />
            <p className="text-xs font-bold text-neutral-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400">
              Home
            </p>
            <p className="text-[10px] text-neutral-500">Landing page</p>
          </Link>
        </div>

        <div className="pt-2">
          <Link to="/dashboard">
            <Button size="lg" className="w-full font-bold text-xs h-10 shadow-md">
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
