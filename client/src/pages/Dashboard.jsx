import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Compass,
  Calendar,
  MessageSquare,
  ChevronRight,
  TrendingUp,
  BookOpen,
  CheckCircle2,
  Users,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { getUpcomingSessions } from '@/services/session.service.js'
import { discoverMatches } from '@/services/match.service.js'
import { useAuthStore } from '@/store/authStore.js'
import { Avatar } from '@/components/ui/Avatar.jsx'
import { Button } from '@/components/ui/Button.jsx'
import { formatDate } from '@/lib/utils.js'
import { getReputationTier } from '@/lib/constants.js'

export default function Dashboard() {
  const { user } = useAuthStore()

  const sessionsQ = useQuery({
    queryKey: ['sessions', 'upcoming'],
    queryFn: getUpcomingSessions,
    staleTime: 60_000,
  })

  const matchesQ = useQuery({
    queryKey: ['discover', '', {}],
    queryFn: () => discoverMatches({ page: 1, limit: 6 }),
    staleTime: 2 * 60_000,
  })

  const sessions = sessionsQ.data?.data || []
  const matches = matchesQ.data?.data || matchesQ.data?.matches || []
  const firstName = user?.name?.split(' ')[0] || 'Member'
  const teachSkills = user?.skills_teach || []
  const learnSkills = user?.skills_learn || []
  const repScore = user?.reputation?.score ?? 0
  const tier = getReputationTier(repScore)
  const sessionsCount = user?.reputation?.sessions_completed ?? 0

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-6xl mx-auto space-y-5">
      {/* ── Top Header Greeting ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            Welcome back, {firstName}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5 font-medium">
            {formatDate(new Date(), 'EEEE, MMMM dd, yyyy')} · Peer Skill Exchange
          </p>
        </div>

        <div className="grid grid-cols-2 sm:flex items-center gap-2">
          <Link to="/discover">
            <Button size="sm" className="w-full sm:w-auto h-10 px-4 text-xs font-bold shadow-md whitespace-nowrap">
              <Compass className="h-4 w-4 mr-1.5 shrink-0" />
              Discover Matches
            </Button>
          </Link>
          <Link to="/chat">
            <Button size="sm" variant="outline" className="w-full sm:w-auto h-10 px-4 text-xs font-bold whitespace-nowrap">
              <MessageSquare className="h-4 w-4 mr-1.5 shrink-0" />
              Messages
            </Button>
          </Link>
        </div>
      </div>

      {/* ── High-Dark Continuous Tilted Shine Stat Tiles ───────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Metric 1: Reputation */}
        <div className="card-tile-shine p-4 rounded-2xl flex flex-col justify-between min-h-[96px]">
          <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Reputation
          </p>
          <div className="flex items-center justify-between gap-1.5 mt-2">
            <span className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tabular-nums tracking-tight">
              {repScore}
            </span>
            <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200/60 dark:border-indigo-700/60 px-2 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap">
              {tier.label}
            </span>
          </div>
        </div>

        {/* Metric 2: Sessions Completed */}
        <div className="card-tile-shine p-4 rounded-2xl flex flex-col justify-between min-h-[96px]">
          <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Sessions Done
          </p>
          <div className="flex items-center justify-between gap-1.5 mt-2">
            <span className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tabular-nums tracking-tight">
              {sessionsCount}
            </span>
            <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200/60 dark:border-emerald-700/60 px-2 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap">
              {sessionsCount > 0 ? 'Active' : 'Get Started'}
            </span>
          </div>
        </div>

        {/* Metric 3: Skills Teaching */}
        <div className="card-tile-shine p-4 rounded-2xl flex flex-col justify-between min-h-[96px]">
          <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Teaching
          </p>
          <div className="flex items-center justify-between gap-1.5 mt-2">
            <span className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tabular-nums tracking-tight">
              {teachSkills.length}
            </span>
            <span className="text-[10px] font-extrabold text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800/90 border border-neutral-200 dark:border-neutral-700 px-2 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap">
              Skills
            </span>
          </div>
        </div>

        {/* Metric 4: Goals Learning */}
        <div className="card-tile-shine p-4 rounded-2xl flex flex-col justify-between min-h-[96px]">
          <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Goals Learning
          </p>
          <div className="flex items-center justify-between gap-1.5 mt-2">
            <span className="text-2xl sm:text-3xl font-black text-neutral-900 dark:text-white tabular-nums tracking-tight">
              {learnSkills.length}
            </span>
            <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200/60 dark:border-indigo-700/60 px-2 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap">
              {learnSkills.length > 0 ? 'In Progress' : 'Add Goals'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Main 2-Column Responsive Layout ──────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Left 2 Columns: Matches & Sessions */}
        <div className="lg:col-span-2 space-y-5">
          {/* Top Matches Recommendation Section */}
          <div className="card-shine rounded-3xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                  Recommended Skill Swaps
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Peers matching your teaching and learning goals
                </p>
              </div>
              <Link
                to="/discover"
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 shrink-0"
              >
                <span>View all</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {matchesQ.isLoading ? (
                <div className="py-8 text-center text-neutral-500 text-xs">
                  Loading recommendations...
                </div>
              ) : matches.length === 0 ? (
                <div className="py-8 px-4 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 text-center">
                  <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    No matching peers found right now
                  </p>
                  <p className="text-[11px] text-neutral-500 mt-0.5 mb-3">
                    Add more teaching and learning skills to increase your swap matches.
                  </p>
                  <Link to="/profile/edit">
                    <Button size="sm" variant="outline" className="h-8 text-xs px-3 font-bold">
                      Update your skills
                    </Button>
                  </Link>
                </div>
              ) : (
                matches.slice(0, 3).map((m) => {
                  const partner = m.user || {}
                  const partnerTeach = partner.skills_teach?.[0]?.skill || ''
                  const myTeach = teachSkills[0]?.skill || ''
                  const compScore = m.compatibility_score ?? 0

                  return (
                    <div
                      key={m._id || m.partner_id}
                      className="p-4 rounded-2xl border border-neutral-200/80 dark:border-white/10 bg-neutral-50/60 dark:bg-neutral-950/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-indigo-400/50 dark:hover:border-indigo-500/40 transition-all shadow-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar src={partner.avatar?.url} name={partner.name} size="md" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-neutral-900 dark:text-white truncate">
                              {partner.name || 'Peer'}
                            </h3>
                            {partner.role && (
                              <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 capitalize">
                                {partner.role}
                              </span>
                            )}
                          </div>
                          {(partner.institution || partner.location) && (
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5 font-medium">
                              {[partner.institution, partner.location].filter(Boolean).join(' · ')}
                            </p>
                          )}
                          {partnerTeach && (
                            <div className="flex items-center gap-2 mt-1.5 text-xs">
                              <span className="font-bold text-neutral-800 dark:text-neutral-200">
                                Teaches {partnerTeach}
                              </span>
                              {myTeach && (
                                <>
                                  <span className="text-neutral-400">·</span>
                                  <span className="text-neutral-500 dark:text-neutral-400">
                                    Learns {myTeach}
                                  </span>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-200 dark:border-neutral-800">
                        {compScore > 0 && (
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200/60 dark:border-emerald-800/60 px-2.5 py-1 rounded-full tabular-nums">
                            {compScore}% match
                          </span>
                        )}
                        <Link to="/discover">
                          <Button size="sm" className="h-8 text-xs px-3 font-bold">
                            Connect
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Upcoming Sessions Card */}
          <div className="card-shine rounded-3xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                  Upcoming 1-on-1 Sessions
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Your scheduled live video exchanges
                </p>
              </div>
              <Link
                to="/sessions"
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 shrink-0"
              >
                <span>Manage</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {sessions.length === 0 ? (
              <div className="py-8 px-4 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 text-center">
                <Calendar className="h-7 w-7 text-neutral-400 mx-auto mb-2 opacity-70" />
                <p className="text-xs font-bold text-neutral-700 dark:text-neutral-200">
                  No sessions scheduled
                </p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 mb-3 font-medium">
                  Connect with a match to book your next session.
                </p>
                <Link to="/discover">
                  <Button size="sm" variant="outline" className="h-7 text-xs px-3 font-bold">
                    Schedule session
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {sessions.map((s) => (
                  <div
                    key={s._id}
                    className="p-3.5 rounded-2xl border border-neutral-200/80 dark:border-white/10 bg-neutral-50/60 dark:bg-neutral-950/70 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-neutral-900 dark:text-white truncate">
                        {s.title || s.skill}
                      </p>
                      <p className="text-neutral-500 dark:text-neutral-400 mt-0.5">
                        with {s.teacher?.name} · {formatDate(s.scheduled_at, 'EEE, MMM dd · h:mm a')}
                      </p>
                    </div>
                    <Link to={`/sessions/${s._id}`}>
                      <Button size="sm" variant="outline" className="h-7 text-xs px-2.5 font-bold">
                        Details
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Skills & Quick Links */}
        <div className="space-y-5">
          {/* Your Teaching Skills Card */}
          <div className="card-shine rounded-3xl p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
                Skills You Share
              </h2>
              <Link to="/profile/edit" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                Edit
              </Link>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {teachSkills.length === 0 ? (
                <p className="text-xs text-neutral-500 italic">No teaching skills listed yet.</p>
              ) : (
                teachSkills.map((s, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60"
                  >
                    <span>{s.skill}</span>
                    <span className="text-[10px] text-indigo-500 dark:text-indigo-400 capitalize">
                      ({s.level})
                    </span>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Learning Goals Card */}
          <div className="card-shine rounded-3xl p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
                Learning Goals
              </h2>
              <Link to="/profile/edit" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                Edit
              </Link>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {learnSkills.length === 0 ? (
                <p className="text-xs text-neutral-500 italic">No learning goals declared yet.</p>
              ) : (
                learnSkills.map((s, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60"
                  >
                    <span>{s.skill}</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 capitalize">
                      ({s.priority})
                    </span>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="card-shine rounded-3xl p-5 space-y-2.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Quick Shortcuts
            </h2>

            <div className="space-y-1 text-xs">
              <Link
                to="/discover"
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-colors font-bold text-neutral-700 dark:text-neutral-200"
              >
                <div className="flex items-center gap-2">
                  <Compass className="h-4 w-4 text-indigo-500" />
                  <span>Discover Swap Matches</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
              </Link>

              <Link
                to="/sessions"
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-colors font-bold text-neutral-700 dark:text-neutral-200"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-emerald-500" />
                  <span>Manage Schedule</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
              </Link>

              <Link
                to="/profile/edit"
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-colors font-bold text-neutral-700 dark:text-neutral-200"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-amber-500" />
                  <span>Update Availability</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-neutral-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
