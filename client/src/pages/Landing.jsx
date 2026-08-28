import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowLeft, Sun, Moon, Sparkles } from 'lucide-react'
import { useInView } from 'react-intersection-observer'
import { Button } from '@/components/ui/Button.jsx'
import { Logo } from '@/components/ui/Logo.jsx'
import { SignatureUnderline } from '@/components/ui/SignatureUnderline.jsx'
import { useThemeStore } from '@/store/themeStore.js'

export default function Landing() {
  const [heroRef, heroInView] = useInView({ triggerOnce: true, threshold: 0.1 })
  const [stepsRef, stepsInView] = useInView({ triggerOnce: true, threshold: 0.1 })
  const [matchesRef, matchesInView] = useInView({ triggerOnce: true, threshold: 0.1 })
  const [ctaRef, ctaInView] = useInView({ triggerOnce: true, threshold: 0.1 })
  const { theme, toggleTheme } = useThemeStore()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 font-sans selection:bg-indigo-500/30 transition-colors">
      {/* ── Top Navigation Bar ──────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
        <Link to="/" className="flex items-center">
          <Logo size="md" />
        </Link>

        <div className="flex items-center gap-3">
          {/* Light / Dark Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-neutral-600" />}
          </button>

          <Link to="/auth/login">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex font-bold text-xs">
              Sign in
            </Button>
          </Link>
          <Link to="/auth/register">
            <Button size="sm" className="font-bold text-xs shadow-sm">
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="px-6 py-20 lg:py-28 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              ref={heroRef}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: heroInView ? 1 : 0, y: heroInView ? 0 : 24 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-[1.1]">
                Exchange skills,<br />
                <span className="relative inline-block text-indigo-600 dark:text-indigo-400">
                  not money.
                  <SignatureUnderline delay={0.35} duration={1.1} />
                </span>
              </h1>
              <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400 mt-6 max-w-md leading-relaxed">
                Connect with peers who know what you want to learn. Teach them what you know. Zero fees, zero subscriptions — pure mutual growth.
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-8">
                <Link to="/auth/register">
                  <Button size="lg" className="text-sm sm:text-base px-7 font-bold shadow-md">
                    Find your match
                  </Button>
                </Link>
                <a href="#how-it-works">
                  <Button variant="outline" size="lg" className="text-sm sm:text-base px-7 font-bold">
                    See how it works
                  </Button>
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: heroInView ? 1 : 0, y: heroInView ? 0 : 20 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="card-shine p-6 rounded-3xl shadow-xl relative z-10">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-200 dark:border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-indigo-100 dark:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-700/60 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-sm">
                      AS
                    </div>
                    <div>
                      <p className="font-bold text-sm text-neutral-900 dark:text-white">Arjun S.</p>
                      <p className="text-xs text-neutral-500">Student · Engineering</p>
                    </div>
                  </div>
                  <div className="text-center px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800">
                    <p className="text-base font-black text-emerald-600 dark:text-emerald-400 tabular-nums">94%</p>
                    <p className="text-[9px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">Match</p>
                  </div>
                  <div className="flex items-center gap-3 text-right">
                    <div>
                      <p className="font-bold text-sm text-neutral-900 dark:text-white">Priya M.</p>
                      <p className="text-xs text-neutral-500">Educator · Design</p>
                    </div>
                    <div className="w-11 h-11 rounded-full bg-purple-100 dark:bg-purple-900/60 border border-purple-200 dark:border-purple-700/60 flex items-center justify-center text-purple-700 dark:text-purple-300 font-bold text-sm">
                      PM
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-neutral-100/70 dark:bg-neutral-950/80 rounded-2xl p-3.5 border border-neutral-200 dark:border-neutral-800/80">
                    <div className="flex-1">
                      <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-0.5">Arjun teaches</p>
                      <p className="font-bold text-xs sm:text-sm text-indigo-600 dark:text-indigo-400">Java & Algorithms</p>
                    </div>
                    <ArrowRight className="text-neutral-400 mx-3 h-4 w-4 shrink-0" />
                    <div className="flex-1 text-right">
                      <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-0.5">Priya learns</p>
                      <p className="font-bold text-xs sm:text-sm text-neutral-800 dark:text-neutral-200">Java Backend</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-neutral-100/70 dark:bg-neutral-950/80 rounded-2xl p-3.5 border border-neutral-200 dark:border-neutral-800/80">
                    <div className="flex-1">
                      <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-0.5">Arjun learns</p>
                      <p className="font-bold text-xs sm:text-sm text-neutral-800 dark:text-neutral-200">Figma & UI/UX</p>
                    </div>
                    <ArrowLeft className="text-neutral-400 mx-3 h-4 w-4 shrink-0" />
                    <div className="flex-1 text-right">
                      <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-0.5">Priya teaches</p>
                      <p className="font-bold text-xs sm:text-sm text-emerald-600 dark:text-emerald-400">Figma Mastery</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="px-6 py-20 max-w-7xl mx-auto border-t border-neutral-200 dark:border-neutral-800">
          <motion.div
            ref={stepsRef}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: stepsInView ? 1 : 0, y: stepsInView ? 0 : 24 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold text-center mb-14 text-neutral-900 dark:text-white">
              Simple by design.
            </h2>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="card-shine p-6 rounded-3xl space-y-3">
                <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">01</span>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Declare your skills</h3>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  List what you can teach and what you want to learn. Add your proficiency level and weekly schedule.
                </p>
              </div>

              <div className="card-shine p-6 rounded-3xl space-y-3">
                <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">02</span>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Get matched</h3>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  AI algorithm finds compatible peers based on bidirectional skill overlap, level fit, and availability.
                </p>
              </div>

              <div className="card-shine p-6 rounded-3xl space-y-3">
                <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">03</span>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Exchange sessions</h3>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Schedule sessions, meet via built-in video, track your learning roadmap, and grow together.
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Core Platform Highlights */}
        <section className="py-12 border-y border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-6">
          <div className="max-w-7xl mx-auto flex flex-wrap gap-8 lg:gap-16 justify-center text-center">
            {[
              { num: 'Peer-to-Peer', label: '1-on-1 direct knowledge exchange' },
              { num: 'Zero Fees', label: 'Free for students & professors' },
              { num: '60+ Skills', label: 'Tech, design, business & languages' },
              { num: 'AI Powered', label: 'Smart matching & session roadmaps' },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center">
                <span className="text-xl lg:text-2xl font-black text-neutral-900 dark:text-white">{stat.num}</span>
                <span className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 font-medium">{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-20 text-center max-w-3xl mx-auto">
          <motion.div
            ref={ctaRef}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: ctaInView ? 1 : 0, y: ctaInView ? 0 : 24 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white">
              Start exchanging today.
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 mt-3 mb-8 text-base">
              Create your account in under 2 minutes. Free peer learning without barriers.
            </p>
            <Link to="/auth/register">
              <Button size="lg" className="px-8 text-sm font-bold shadow-md">
                Create your account
              </Button>
            </Link>
          </motion.div>
        </section>
      </main>

      <footer className="border-t border-neutral-200 dark:border-neutral-800 py-8 px-6 text-xs text-neutral-500 mt-auto bg-white dark:bg-neutral-950">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-bold text-neutral-800 dark:text-neutral-200">SkillSync</div>
          <div className="flex items-center gap-6">
            <Link to="/auth/login" className="hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors">Sign in</Link>
            <a href="#how-it-works" className="hover:text-neutral-900 dark:hover:text-neutral-200 transition-colors">How it works</a>
          </div>
          <div>&copy; 2026 SkillSync. Pure Peer-to-Peer Knowledge Exchange.</div>
        </div>
      </footer>
    </div>
  )
}
