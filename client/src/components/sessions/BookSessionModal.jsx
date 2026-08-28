import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { X, Calendar, Clock, User, BookOpen, Loader2, AlertCircle } from 'lucide-react'
import { createSession } from '@/services/session.service.js'
import { useAuthStore } from '@/store/authStore.js'
import { Button } from '@/components/ui/Button.jsx'
import { cn } from '@/lib/utils.js'
import { notify } from '@/lib/notify.jsx'

const DURATIONS = [
  { label: '30 min', value: 30 },
  { label: '45 min', value: 45 },
  { label: '1 hour', value: 60 },
  { label: '1.5 hours', value: 90 },
  { label: '2 hours', value: 120 },
]

export default function BookSessionModal({ match, onClose }) {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()

  const isUserA = match.user_a?.user?._id === user._id
  const partner = isUserA ? match.user_b : match.user_a
  const partnerUser = partner?.user || {}

  const myTeachSkill = isUserA ? match.user_a?.teaches_skill : match.user_b?.teaches_skill
  const theirTeachSkill = isUserA ? match.user_b?.teaches_skill : match.user_a?.teaches_skill

  const [role, setRole] = useState('teacher')
  const [title, setTitle] = useState('')
  const [skill, setSkill] = useState(myTeachSkill || '')
  const [sessionDate, setSessionDate] = useState('')
  const [sessionTime, setSessionTime] = useState('10:00')
  const [duration, setDuration] = useState(60)
  const [description, setDescription] = useState('')
  const [dateTouched, setDateTouched] = useState(false)

  const handleRoleChange = (newRole) => {
    setRole(newRole)
    setSkill(newRole === 'teacher' ? myTeachSkill : theirTeachSkill)
  }

  const teacherId = role === 'teacher' ? user._id : partnerUser._id
  const learnerId = role === 'teacher' ? partnerUser._id : user._id

  const mutation = useMutation({
    mutationFn: () => {
      const combined = new Date(`${sessionDate}T${sessionTime || '00:00'}:00`)
      return createSession({
        match_id: match._id,
        teacher_id: teacherId,
        learner_id: learnerId,
        skill: skill || myTeachSkill || 'Skill Swap',
        title: title || `${skill || myTeachSkill} session with ${partnerUser.name}`,
        description,
        scheduled_at: combined.toISOString(),
        duration_minutes: duration,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      notify.success(`Session booked with ${partnerUser.name}!`, 'Session Created')
      onClose()
    },
    onError: (err) => {
      notify.error(err.message || 'Failed to create session. Try a different time slot.', 'Booking Failed')
    },
  })

  const today = new Date().toISOString().split('T')[0]
  const dateError = dateTouched && !sessionDate

  const handleConfirm = () => {
    setDateTouched(true)
    if (!sessionDate) {
      notify.error('Please select a date for the session.', 'Date Required')
      return
    }
    mutation.mutate()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="card-shine w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header — fixed */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-neutral-800 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-neutral-100">Book a Session</h2>
            <p className="text-xs text-neutral-500 mt-0.5">Schedule a 1-on-1 swap with {partnerUser.name}</p>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 flex items-center justify-center transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">

          {/* Role selection */}
          <div>
            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-2">
              Your role in this session
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleRoleChange('teacher')}
                className={cn(
                  'flex flex-col items-start p-3.5 rounded-xl border text-left transition-all',
                  role === 'teacher'
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-neutral-700 hover:border-neutral-600 bg-neutral-900'
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <User className={cn('h-4 w-4', role === 'teacher' ? 'text-indigo-400' : 'text-neutral-500')} />
                  <span className={cn('text-sm font-bold', role === 'teacher' ? 'text-indigo-300' : 'text-neutral-400')}>
                    I am teaching
                  </span>
                </div>
                <span className="text-[11px] text-neutral-500">You teach: <span className="text-neutral-300 font-medium">{myTeachSkill || 'your skill'}</span></span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('learner')}
                className={cn(
                  'flex flex-col items-start p-3.5 rounded-xl border text-left transition-all',
                  role === 'learner'
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-neutral-700 hover:border-neutral-600 bg-neutral-900'
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <BookOpen className={cn('h-4 w-4', role === 'learner' ? 'text-indigo-400' : 'text-neutral-500')} />
                  <span className={cn('text-sm font-bold', role === 'learner' ? 'text-indigo-300' : 'text-neutral-400')}>
                    I am learning
                  </span>
                </div>
                <span className="text-[11px] text-neutral-500">They teach: <span className="text-neutral-300 font-medium">{theirTeachSkill || 'their skill'}</span></span>
              </button>
            </div>
          </div>

          {/* Skill being swapped */}
          <div>
            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-1.5">
              Skill topic
            </label>
            <input
              type="text"
              value={skill}
              onChange={e => setSkill(e.target.value)}
              placeholder="e.g. Java, React, SQL..."
              className="w-full h-10 rounded-xl border border-neutral-700 bg-neutral-900 px-3 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-1.5">
              Session title
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={`${skill || 'Skill'} session with ${partnerUser.name}`}
              className="w-full h-10 rounded-xl border border-neutral-700 bg-neutral-900 px-3 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Date & Time — split for reliable picker */}
          <div>
            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Date and Time
              <span className="text-red-400 font-black">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Date picker */}
              <div>
                <p className="text-[11px] text-neutral-500 mb-1 font-medium">Date</p>
                <input
                  type="date"
                  value={sessionDate}
                  min={today}
                  onChange={e => { setSessionDate(e.target.value); setDateTouched(true) }}
                  className={cn(
                    'w-full h-10 rounded-xl border bg-neutral-900 px-3 text-sm text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-colors',
                    dateError ? 'border-red-500' : 'border-neutral-700 hover:border-neutral-600'
                  )}
                />
              </div>
              {/* Time picker */}
              <div>
                <p className="text-[11px] text-neutral-500 mb-1 font-medium">Time</p>
                <input
                  type="time"
                  value={sessionTime}
                  onChange={e => setSessionTime(e.target.value)}
                  className="w-full h-10 rounded-xl border border-neutral-700 hover:border-neutral-600 bg-neutral-900 px-3 text-sm text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                />
              </div>
            </div>
            {dateError && (
              <p className="flex items-center gap-1.5 text-xs text-red-400 mt-1.5 font-medium">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                Please select a date
              </p>
            )}
          </div>

          {/* Duration */}
          <div>
            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> Duration
            </label>
            <div className="flex flex-wrap gap-2">
              {DURATIONS.map(d => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setDuration(d.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all',
                    duration === d.value
                      ? 'border-indigo-500 bg-indigo-500/15 text-indigo-300'
                      : 'border-neutral-700 text-neutral-500 hover:border-neutral-600 hover:text-neutral-300'
                  )}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description — optional */}
          <div>
            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-1.5">
              Notes / agenda <span className="text-neutral-600 normal-case font-normal">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What topics will you cover? Any materials needed?"
              rows={2}
              className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
        </div>

        {/* Footer — fixed at bottom */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-800 bg-neutral-950/60 shrink-0">
          <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={mutation.isPending}
            className="min-w-[120px]"
          >
            {mutation.isPending
              ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Booking...</>
              : 'Confirm booking'
            }
          </Button>
        </div>
      </div>
    </div>
  )
}
