import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { Calendar, Video, Clock, ArrowRight, Plus, Compass, ShieldAlert, Play, Loader2 } from 'lucide-react'
import { getSessions, startSession } from '@/services/session.service.js'
import { useAuthStore } from '@/store/authStore.js'
import { Button } from '@/components/ui/Button.jsx'
import { Avatar } from '@/components/ui/Avatar.jsx'
import { formatDate, formatDuration, cn } from '@/lib/utils.js'
import { notify } from '@/lib/notify.jsx'

function SessionCard({ session, currentUserId }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const isTeacher = session.teacher?._id === currentUserId || session.teacher === currentUserId
  const isLive = session.status === 'live'
  const isScheduled = session.status === 'scheduled'

  const startMutation = useMutation({
    mutationFn: () => startSession(session._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      notify.success('Session is now live. Entering video room...', 'Session Started')
      setTimeout(() => navigate(`/video/${session._id}`), 800)
    },
    onError: (err) => notify.error(err.message || 'Failed to start session', 'Error'),
  })

  const statusBadge = {
    scheduled: 'bg-blue-950/40 text-blue-400 border-blue-800/40',
    live: 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40 animate-pulse',
    completed: 'bg-neutral-800 text-neutral-400 border-neutral-700',
    cancelled: 'bg-red-950/40 text-red-400 border-red-800/40',
  }

  return (
    <div className="card-shine rounded-2xl p-4 sm:p-5 shadow-md space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-900/30 text-indigo-400 border border-indigo-800/40">
              {session.skill || 'Skill Swap'}
            </span>
            <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border', statusBadge[session.status] || statusBadge.scheduled)}>
              {session.status === 'live' ? 'LIVE NOW' : session.status}
            </span>
            {isTeacher && isScheduled && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-violet-900/30 text-violet-400 border border-violet-800/40">
                You are teaching
              </span>
            )}
            {!isTeacher && isScheduled && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-900/30 text-amber-400 border border-amber-800/40">
                You are learning
              </span>
            )}
          </div>
          <h3 className="text-sm sm:text-base font-bold text-neutral-100 leading-snug">
            {session.title || '1-on-1 Swap Session'}
          </h3>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs font-bold text-neutral-200">{formatDate(session.scheduled_at, 'MMM dd')}</p>
          <p className="text-[11px] text-neutral-500 mt-0.5">{formatDate(session.scheduled_at, 'h:mm a')}</p>
        </div>
      </div>

      {/* Participants */}
      <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-950/50 border border-neutral-800/70 text-xs">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Avatar src={session.teacher?.avatar?.url} name={session.teacher?.name} size="sm" />
          <div className="min-w-0">
            <p className="text-[10px] text-neutral-500 font-semibold uppercase">Teacher</p>
            <p className="font-semibold text-neutral-200 truncate">{session.teacher?.name || 'Peer'}</p>
          </div>
        </div>
        <ArrowRight className="h-3.5 w-3.5 text-neutral-600 shrink-0 mx-2" />
        <div className="flex items-center justify-end gap-2 min-w-0 flex-1 text-right">
          <div className="min-w-0">
            <p className="text-[10px] text-neutral-500 font-semibold uppercase">Learner</p>
            <p className="font-semibold text-neutral-200 truncate">{session.learner?.name || 'Peer'}</p>
          </div>
          <Avatar src={session.learner?.avatar?.url} name={session.learner?.name} size="sm" />
        </div>
      </div>

      {/* JOIN / START banner for upcoming & live sessions */}
      {(isScheduled || isLive) && (
        <div className={cn(
          'rounded-xl p-3 flex items-center justify-between gap-3 border',
          isLive
            ? 'bg-emerald-950/30 border-emerald-800/40'
            : 'bg-indigo-950/30 border-indigo-800/40'
        )}>
          <div className="min-w-0">
            {isLive ? (
              <>
                <p className="text-xs font-bold text-emerald-300">Session is live now</p>
                <p className="text-[11px] text-neutral-400 mt-0.5">Click to enter the video room</p>
              </>
            ) : (
              <>
                <p className="text-xs font-bold text-indigo-300">
                  {isTeacher ? 'Start the session when ready' : 'Waiting for teacher to start'}
                </p>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  {isTeacher
                    ? 'Click "Start" to go live — your learner will be notified'
                    : 'You can also join early to be ready'}
                </p>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isLive && (
              <Link to={`/video/${session._id}`}>
                <Button size="sm" className="h-8 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs">
                  <Video className="h-3.5 w-3.5 mr-1" /> Join call
                </Button>
              </Link>
            )}
            {isScheduled && (
              <>
                {isTeacher ? (
                  <Button
                    size="sm"
                    className="h-8 px-3 bg-indigo-600 hover:bg-indigo-500 font-bold text-xs"
                    onClick={() => startMutation.mutate()}
                    disabled={startMutation.isPending}
                  >
                    {startMutation.isPending
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      : <><Play className="h-3.5 w-3.5 mr-1" /> Start</>
                    }
                  </Button>
                ) : (
                  <Link to={`/video/${session._id}`}>
                    <Button size="sm" className="h-8 px-3 font-bold text-xs" variant="outline">
                      <Video className="h-3.5 w-3.5 mr-1" /> Join early
                    </Button>
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-neutral-500">
          <Clock className="h-3.5 w-3.5" />
          <span>{formatDuration(session.duration_minutes || 60)}</span>
        </div>
        <Link to={`/sessions/${session._id}`}>
          <Button variant="ghost" size="sm" className="h-7 text-xs px-2 text-neutral-400 hover:text-neutral-200">
            View details
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default function SessionsList() {
  const [tab, setTab] = useState('upcoming')
  const { user } = useAuthStore()

  const upcomingQ = useQuery({ queryKey: ['sessions', 'scheduled'], queryFn: () => getSessions({ status: 'scheduled' }) })
  const liveQ = useQuery({ queryKey: ['sessions', 'live'], queryFn: () => getSessions({ status: 'live' }) })
  const completedQ = useQuery({ queryKey: ['sessions', 'completed'], queryFn: () => getSessions({ status: 'completed' }) })
  const cancelledQ = useQuery({ queryKey: ['sessions', 'cancelled'], queryFn: () => getSessions({ status: 'cancelled' }) })

  const upcoming = upcomingQ.data?.data || upcomingQ.data?.pagination?.docs || []
  const live = liveQ.data?.data || liveQ.data?.pagination?.docs || []
  const completed = completedQ.data?.data || completedQ.data?.pagination?.docs || []
  const cancelled = cancelledQ.data?.data || cancelledQ.data?.pagination?.docs || []

  const allUpcoming = [...live, ...upcoming] // live sessions first

  const currentList = tab === 'upcoming' ? allUpcoming : tab === 'completed' ? completed : cancelled
  const isLoading = tab === 'upcoming'
    ? (upcomingQ.isLoading || liveQ.isLoading)
    : tab === 'completed' ? completedQ.isLoading : cancelledQ.isLoading

  const tabs = [
    { key: 'upcoming', label: 'Upcoming', count: allUpcoming.length },
    { key: 'completed', label: 'Completed', count: completed.length },
    { key: 'cancelled', label: 'Cancelled', count: cancelled.length },
  ]

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-5 max-w-4xl mx-auto min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-100">Sessions</h1>
          <p className="text-xs sm:text-sm text-neutral-500 truncate">
            Manage your booked 1-on-1 skill exchange meetings
          </p>
        </div>
        {user?.is_email_verified ? (
          <Link to="/matches" className="shrink-0">
            <Button size="sm" className="h-8 px-3 text-xs whitespace-nowrap shadow-sm">
              <Plus className="h-3.5 w-3.5 mr-1" /> Book session
            </Button>
          </Link>
        ) : (
          <Link to="/profile/me" className="shrink-0">
            <Button size="sm" className="h-8 px-3 text-xs whitespace-nowrap bg-amber-500 text-neutral-950 hover:bg-amber-400 font-bold border-none shadow-sm">
              <ShieldAlert className="h-3.5 w-3.5 mr-1" /> Verify Email First
            </Button>
          </Link>
        )}
      </div>

      {/* Live sessions alert banner */}
      {live.length > 0 && (
        <div className="mb-4 p-3.5 rounded-2xl border border-emerald-700/50 bg-emerald-950/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <p className="text-sm font-bold text-emerald-300">
              {live.length} session{live.length > 1 ? 's' : ''} live right now
            </p>
          </div>
          <Link to={`/video/${live[0]._id}`}>
            <Button size="sm" className="h-7 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs">
              <Video className="h-3.5 w-3.5 mr-1" /> Join now
            </Button>
          </Link>
        </div>
      )}

      {/* Tabs */}
      <div className="grid grid-cols-3 p-1 rounded-xl bg-neutral-900 border border-neutral-800 mb-5">
        {tabs.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`py-2 px-1 rounded-lg text-xs font-bold transition-all text-center flex items-center justify-center gap-1 ${
              tab === key ? 'bg-indigo-600 text-white shadow-sm' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <span>{label}</span>
            {count > 0 && (
              <span className={`text-[10px] px-1.5 rounded-full font-bold ${
                tab === key ? 'bg-white/20 text-white' : 'bg-neutral-800 text-neutral-400'
              }`}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-3">
        {isLoading && (
          <div className="py-12 text-center text-xs text-neutral-500">
            <div className="h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading sessions...
          </div>
        )}

        {!isLoading && currentList.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl border border-neutral-800 bg-neutral-900/50 shadow-sm">
            <div className="h-11 w-11 rounded-2xl bg-neutral-800 flex items-center justify-center text-neutral-400 mb-3">
              <Calendar className="h-5 w-5 opacity-70" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-neutral-100 mb-1">No {tab} sessions</h3>
            <p className="text-xs text-neutral-500 mb-4 max-w-xs leading-relaxed">
              {tab === 'upcoming'
                ? 'Go to Matches and click "Book session" to schedule a skill exchange.'
                : `You don't have any ${tab} sessions.`}
            </p>
            {tab === 'upcoming' && (
              <Link to="/matches">
                <Button size="sm" variant="outline" className="text-xs h-8 px-3">
                  <Compass className="h-3.5 w-3.5 mr-1" /> Go to Matches
                </Button>
              </Link>
            )}
          </div>
        )}

        {!isLoading && currentList.map((session) => (
          <SessionCard key={session._id} session={session} currentUserId={user?._id} />
        ))}
      </div>
    </div>
  )
}
