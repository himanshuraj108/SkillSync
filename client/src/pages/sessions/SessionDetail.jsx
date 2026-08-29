import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft, Video, Clock, MessageSquare, ShieldAlert,
  Play, CheckCircle2, User, BookOpen, AlertCircle, Calendar, Sparkles, Loader2,
  Download, Trash2, Lock
} from 'lucide-react'
import { getSession, startSession, cancelSession, deleteSessionRecording } from '@/services/session.service.js'
import { useAuthStore } from '@/store/authStore.js'
import { Button } from '@/components/ui/Button.jsx'
import { Avatar } from '@/components/ui/Avatar.jsx'
import { formatDate, formatDuration, cn } from '@/lib/utils.js'
import { notify } from '@/lib/notify.jsx'

export default function SessionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [cancelReason, setCancelReason] = useState('')
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  const { data: sessionRes, isLoading, isError } = useQuery({
    queryKey: ['session', id],
    queryFn: () => getSession(id),
  })

  // Unwrap response properly
  const session = sessionRes?.data || sessionRes

  const startMutation = useMutation({
    mutationFn: () => startSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session', id] })
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      notify.success('Session is now live! Entering video room...', 'Session Started')
      setTimeout(() => navigate(`/video/${id}`), 600)
    },
    onError: (err) => notify.error(err.message || 'Failed to start session', 'Error'),
  })

  const cancelMutation = useMutation({
    mutationFn: () => cancelSession(id, cancelReason || 'User cancelled session'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session', id] })
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      notify.info('Session has been cancelled.', 'Cancelled')
      setShowCancelConfirm(false)
    },
    onError: (err) => notify.error(err.message || 'Failed to cancel session', 'Error'),
  })

  const deleteRecordingMutation = useMutation({
    mutationFn: () => deleteSessionRecording(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session', id] })
      notify.success('Recording removed from your account.', 'Deleted')
    },
    onError: (err) => notify.error(err.message || 'Failed to delete recording', 'Error'),
  })

  const getRemainingDays = (expiresAt) => {
    if (!expiresAt) return null
    const diffMs = new Date(expiresAt).getTime() - Date.now()
    if (diffMs <= 0) return 'Expired'
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    if (days > 0) return `${days}d ${hours}h remaining`
    return `${hours}h remaining`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin mb-3" />
        <p className="text-sm text-neutral-400">Loading session details...</p>
      </div>
    )
  }

  if (isError || !session || !session._id) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 text-center">
        <div className="h-12 w-12 rounded-2xl bg-red-950/50 border border-red-800 text-red-400 flex items-center justify-center mb-3">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold text-neutral-100 mb-1">Session Not Found</h2>
        <p className="text-xs text-neutral-500 mb-4 max-w-xs">
          This session may have been removed or you may not have permission to view it.
        </p>
        <Link to="/sessions">
          <Button variant="outline" size="sm">Back to Sessions</Button>
        </Link>
      </div>
    )
  }

  const isUpcoming = session.status === 'scheduled'
  const isLive = session.status === 'live'
  const isCompleted = session.status === 'completed'
  const isCancelled = session.status === 'cancelled'

  const isTeacher = session.teacher?._id === user?._id || session.teacher === user?._id
  const isLearner = session.learner?._id === user?._id || session.learner === user?._id
  const isParticipant = isTeacher || isLearner
  const partner = isTeacher ? session.learner : session.teacher

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-4xl mx-auto min-h-screen bg-neutral-950 text-neutral-100 font-sans">
      {/* Back button */}
      <button
        onClick={() => navigate('/sessions')}
        className="flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-neutral-200 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Sessions
      </button>

      {/* Main Header Banner */}
      <div className="card-shine rounded-3xl p-6 sm:p-7 border border-neutral-800 bg-neutral-900/60 mb-6 shadow-xl">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-900/40 text-indigo-300 border border-indigo-700/50">
            {session.skill}
          </span>
          <span className={cn(
            'px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border',
            isLive && 'bg-emerald-950/60 text-emerald-300 border-emerald-700/60 animate-pulse',
            isUpcoming && 'bg-blue-950/40 text-blue-300 border-blue-800/40',
            isCompleted && 'bg-neutral-800 text-neutral-300 border-neutral-700',
            isCancelled && 'bg-red-950/40 text-red-300 border-red-800/40'
          )}>
            {isLive ? 'LIVE NOW' : session.status}
          </span>
          {isTeacher && (
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-violet-900/30 text-violet-300 border border-violet-800/40">
              You are the Teacher
            </span>
          )}
          {isLearner && (
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-900/30 text-amber-300 border border-amber-800/40">
              You are the Learner
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-100 tracking-tight mb-3">
          {session.title || `${session.skill} 1-on-1 Exchange`}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-neutral-400">
          <span className="flex items-center gap-1.5 font-medium text-neutral-300">
            <Calendar className="h-4 w-4 text-indigo-400" />
            {formatDate(session.scheduled_at, 'EEEE, MMM dd, yyyy')}
          </span>
          <span className="text-neutral-700">•</span>
          <span className="flex items-center gap-1.5 font-medium text-neutral-300">
            <Clock className="h-4 w-4 text-indigo-400" />
            {formatDate(session.scheduled_at, 'h:mm a')} ({formatDuration(session.duration_minutes || 60)})
          </span>
        </div>
      </div>

      {/* ACTION & CONNECT BAR */}
      {isParticipant && (
        <div className="mb-8">
          {isLive ? (
            <div className="p-6 rounded-3xl border-2 border-emerald-500/60 bg-emerald-950/40 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-2xl shadow-emerald-950/50">
              <div className="flex items-center gap-3.5">
                <span className="h-4 w-4 rounded-full bg-emerald-400 animate-ping shrink-0" />
                <div>
                  <h3 className="text-base font-extrabold text-emerald-200">This Session Is Live Right Now!</h3>
                  <p className="text-xs text-emerald-300/90 mt-0.5">
                    Your partner {partner?.name} can connect in the interactive video & coding room.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Link to={`/video/${session._id}`} className="flex-1 sm:flex-none">
                  <Button size="lg" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm h-11 px-6 shadow-lg shadow-emerald-900/30">
                    <Video className="h-4 w-4 mr-2" />
                    Enter Video Room
                  </Button>
                </Link>
                <Link to="/chat">
                  <Button variant="outline" size="lg" className="h-11 px-4 text-xs font-semibold">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ) : isUpcoming ? (
            <div className="p-6 rounded-3xl border border-indigo-800/50 bg-indigo-950/20 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-xl">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="h-4 w-4 text-indigo-400" />
                  <h3 className="text-sm sm:text-base font-bold text-neutral-100">
                    {isTeacher ? 'Ready to teach your peer?' : 'Ready to learn with your mentor?'}
                  </h3>
                </div>
                <p className="text-xs text-neutral-400 max-w-md">
                  {isTeacher
                    ? 'Click "Start Session" to launch the video call and open the collaborative coding room.'
                    : 'You can enter the video room early to set up your audio and camera.'}
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
                {isTeacher ? (
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 font-bold text-xs h-11 px-6 shadow-lg"
                    onClick={() => startMutation.mutate()}
                    disabled={startMutation.isPending}
                  >
                    {startMutation.isPending ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Starting...</>
                    ) : (
                      <><Play className="h-4 w-4 mr-2" /> Start Session Now</>
                    )}
                  </Button>
                ) : (
                  <Link to={`/video/${session._id}`} className="flex-1 sm:flex-none">
                    <Button size="lg" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 font-bold text-xs h-11 px-6 shadow-lg">
                      <Video className="h-4 w-4 mr-2" /> Join Video Room Early
                    </Button>
                  </Link>
                )}

                <Link to="/chat">
                  <Button variant="outline" size="lg" className="h-11 px-4 text-xs font-semibold" title="Chat with partner">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Participants Cards: Teacher & Learner */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        {/* Teacher Card */}
        <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/50 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <Avatar src={session.teacher?.avatar?.url} name={session.teacher?.name} size="md" />
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400 bg-violet-950/50 px-2 py-0.5 rounded-full border border-violet-800/40">
                  Teacher
                </span>
                {session.teacher?._id === user?._id && (
                  <span className="text-[10px] font-semibold text-neutral-400">(You)</span>
                )}
              </div>
              <p className="font-bold text-neutral-100 text-sm">{session.teacher?.name || 'Peer Teacher'}</p>
              <p className="text-xs text-neutral-500">Teaching {session.skill}</p>
            </div>
          </div>
        </div>

        {/* Learner Card */}
        <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/50 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <Avatar src={session.learner?.avatar?.url} name={session.learner?.name} size="md" />
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-800/40">
                  Learner
                </span>
                {session.learner?._id === user?._id && (
                  <span className="text-[10px] font-semibold text-neutral-400">(You)</span>
                )}
              </div>
              <p className="font-bold text-neutral-100 text-sm">{session.learner?.name || 'Peer Learner'}</p>
              <p className="text-xs text-neutral-500">Learning {session.skill}</p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Guide */}
      <div className="p-5 rounded-2xl border border-neutral-800/80 bg-neutral-900/30 mb-6 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-indigo-400" />
          How to connect, teach, and learn
        </h3>
        <div className="grid sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-neutral-950/50 border border-neutral-800/60">
            <p className="font-bold text-neutral-200 mb-1">1. Enter Video Room</p>
            <p className="text-neutral-500 leading-relaxed">
              Click the Video Call button above to connect with audio, camera, and screen sharing.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-neutral-950/50 border border-neutral-800/60">
            <p className="font-bold text-neutral-200 mb-1">2. Teach & Practice Live</p>
            <p className="text-neutral-500 leading-relaxed">
              Use the live collaborative code editor, shared whiteboard notes, and in-room chat.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-neutral-950/50 border border-neutral-800/60">
            <p className="font-bold text-neutral-200 mb-1">3. Complete & Gain Rep</p>
            <p className="text-neutral-500 leading-relaxed">
              End the call when finished to earn skill exchange completion score and reviews.
            </p>
          </div>
        </div>
      </div>

      {/* Agenda & Notes */}
      <div className="space-y-4 mb-8">
        <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/40">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
            Session Agenda & Topics
          </h3>
          <p className="text-sm text-neutral-300 leading-relaxed">
            {session.agenda || session.description || 'No specific agenda provided. Discuss topics in chat or during the live call.'}
          </p>
        </div>

        {isCompleted && session.ai_summary && (
          <div className="p-5 rounded-2xl border border-indigo-900/40 bg-indigo-950/20">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300 mb-2 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" /> AI Session Summary
            </h3>
            <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap">
              {typeof session.ai_summary === 'string' ? session.ai_summary : JSON.stringify(session.ai_summary, null, 2)}
            </p>
          </div>
        )}

        {/* 7-Day Session Recording Card (If Completed) */}
        {isCompleted && (
          <div className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/50 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800/80">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-indigo-950/80 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Video className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-100">
                    Session Recording
                  </h3>
                  <p className="text-[11px] text-neutral-400">
                    7-Day review & study access
                  </p>
                </div>
              </div>

              {session.recording?.url && session.recording?.is_visible_to_me !== false ? (
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-950/60 border border-amber-800/60 text-amber-300 text-[11px] font-bold">
                    <Clock className="h-3 w-3" />
                    {getRemainingDays(session.recording.expires_at)}
                  </span>
                  <a
                    href={session.recording.url}
                    download={`session-${session._id}.webm`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button size="sm" variant="outline" className="h-8 text-xs font-semibold">
                      <Download className="h-3.5 w-3.5 mr-1" /> Download
                    </Button>
                  </a>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteRecordingMutation.mutate()}
                    disabled={deleteRecordingMutation.isPending}
                    className="h-8 text-xs text-neutral-400 hover:text-red-400"
                    title="Delete recording from my account"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : null}
            </div>

            {session.recording?.url && session.recording?.is_visible_to_me !== false ? (
              <div className="space-y-2">
                <div className="rounded-2xl overflow-hidden border border-neutral-800 bg-black aspect-video flex items-center justify-center">
                  <video
                    controls
                    src={session.recording.url}
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-[11px] text-neutral-500 text-center">
                  This recording is saved exclusively to permitted accounts and will automatically delete in 7 days.
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800/60 text-xs text-neutral-400 flex items-start gap-2.5">
                <Lock className="h-4 w-4 text-neutral-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-neutral-300">
                    {session.recording?.is_expired
                      ? 'Recording Expired'
                      : 'Recording Not Stored'}
                  </p>
                  <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed">
                    {session.recording?.is_expired
                      ? 'The 7-day retention period has ended. This recording has been permanently deleted from storage.'
                      : 'You chose not to save a copy of this session to your account during pre-session setup.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cancel Option (for upcoming sessions) */}
      {isUpcoming && isParticipant && (
        <div className="pt-6 border-t border-neutral-800 flex items-center justify-between">
          {!showCancelConfirm ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCancelConfirm(true)}
              className="text-neutral-500 hover:text-red-400 text-xs"
            >
              Need to cancel this session?
            </Button>
          ) : (
            <div className="flex items-center gap-3 w-full max-w-md">
              <input
                type="text"
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                placeholder="Reason for cancellation..."
                className="h-9 flex-1 rounded-xl border border-red-900/60 bg-neutral-900 px-3 text-xs text-neutral-200 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
              <Button
                size="sm"
                className="bg-red-600 hover:bg-red-500 text-white text-xs h-9 px-3 shrink-0"
                onClick={() => cancelMutation.mutate()}
                disabled={cancelMutation.isPending}
              >
                {cancelMutation.isPending ? 'Cancelling...' : 'Confirm Cancel'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCancelConfirm(false)}
                className="text-xs h-9"
              >
                Back
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
