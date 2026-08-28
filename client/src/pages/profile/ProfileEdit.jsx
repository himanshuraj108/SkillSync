import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Camera,
  Plus,
  X,
  ArrowLeft,
  Award,
  BookOpen,
  Calendar,
  User,
  Upload,
  Check,
  Clock,
  Sparkles,
  Trash2,
  Copy,
} from 'lucide-react'
import { updateProfile, updateSkills, updateAvailability, uploadAvatar } from '@/services/user.service.js'
import { useAuthStore } from '@/store/authStore.js'
import { Button } from '@/components/ui/Button.jsx'
import { Input } from '@/components/ui/Input.jsx'
import { Textarea } from '@/components/ui/Textarea.jsx'
import { Avatar } from '@/components/ui/Avatar.jsx'
import { SKILL_LEVELS, DAYS_OF_WEEK, TIME_SLOTS } from '@/lib/constants.js'
import { cn } from '@/lib/utils.js'
import { notify } from '@/lib/notify.jsx'

export default function ProfileEdit() {
  const { user, setUser } = useAuthStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const fileRef = useRef(null)

  const [activeTab, setActiveTab] = useState('info')
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [avatarFile, setAvatarFile] = useState(null)

  const [basic, setBasic] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    location: user?.location || '',
    timezone: user?.timezone || 'Asia/Kolkata',
    institution: user?.institution || '',
  })

  const [teachSkills, setTeachSkills] = useState(user?.skills_teach || [])
  const [learnSkills, setLearnSkills] = useState(user?.skills_learn || [])
  const [teachInput, setTeachInput] = useState({ skill: '', level: 'intermediate' })
  const [learnInput, setLearnInput] = useState({ skill: '', priority: 'high' })

  // Support for multiple time slots per day: avail[day] is an Array of { start, end }
  const [avail, setAvail] = useState(() => {
    const a = {}
    ;(user?.availability || []).forEach((d) => {
      if (!d.day) return
      if (!a[d.day]) a[d.day] = []
      a[d.day].push({ start: d.start || '09:00', end: d.end || '18:00' })
    })
    return a
  })

  const basicMutation = useMutation({
    mutationFn: () => updateProfile(basic),
    onSuccess: (res) => {
      const updated = res.data || res.user || user
      setUser(updated)
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      notify.success('Your profile details have been saved.', 'Profile Updated')
    },
    onError: (err) => notify.error(err.message || 'Unable to save profile changes.', 'Update Failed'),
  })

  const skillsMutation = useMutation({
    mutationFn: () => updateSkills({ skills_teach: teachSkills, skills_learn: learnSkills }),
    onSuccess: (res) => {
      setUser(res.data || res.user || user)
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      notify.success('Your teaching and learning skills are now active.', 'Skills Synchronized')
    },
    onError: (err) => notify.error(err.message || 'Failed to update skills.', 'Sync Error'),
  })

  const availMutation = useMutation({
    mutationFn: () => {
      const payload = Object.entries(avail).flatMap(([day, slots]) =>
        (Array.isArray(slots) ? slots : [slots]).map((s) => ({
          day,
          start: s.start || '09:00',
          end: s.end || '18:00',
        }))
      )
      return updateAvailability({ availability: payload })
    },
    onSuccess: (res) => {
      const updated = res.data || res.user || user
      setUser({ ...user, availability: updated.availability || [] })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      notify.success('Your weekly session availability has been saved.', 'Schedule Saved')
    },
    onError: (err) => notify.error(err.message || 'Failed to update availability.', 'Schedule Error'),
  })

  const avatarMutation = useMutation({
    mutationFn: (fd) => uploadAvatar(fd),
    onSuccess: (res) => {
      const avatarData = res.data?.avatar || res.data?.data?.avatar || res.avatar
      setUser({ ...user, avatar: avatarData || user?.avatar })
      setAvatarPreview(null)
      setAvatarFile(null)
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      notify.success('Your profile photo has been updated.', 'Photo Saved')
    },
    onError: (err) => notify.error(err.message || 'Photo upload failed.', 'Upload Error'),
  })

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    // Reset input so re-selecting same file triggers onChange again
    e.target.value = ''
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
    // Auto-upload immediately
    const fd = new FormData()
    fd.append('avatar', file)
    avatarMutation.mutate(fd)
  }

  const handleRemovePhoto = async () => {
    // Clear avatar locally (backend delete is optional — just reset to empty)
    setAvatarPreview(null)
    setAvatarFile(null)
    notify.info('Profile photo cleared. Save your profile to confirm.', 'Photo Removed')
  }

  const addTeach = () => {
    if (!teachInput.skill.trim()) return
    setTeachSkills((prev) => [
      ...prev,
      { skill: teachInput.skill.trim(), level: teachInput.level },
    ])
    setTeachInput({ skill: '', level: 'intermediate' })
  }

  const removeTeach = (idx) => {
    setTeachSkills((prev) => prev.filter((_, i) => i !== idx))
  }

  const addLearn = () => {
    if (!learnInput.skill.trim()) return
    setLearnSkills((prev) => [
      ...prev,
      { skill: learnInput.skill.trim(), priority: learnInput.priority },
    ])
    setLearnInput({ skill: '', priority: 'high' })
  }

  const removeLearn = (idx) => {
    setLearnSkills((prev) => prev.filter((_, i) => i !== idx))
  }

  // ── Multi-Slot Availability Helpers ─────────────────────────────────
  const toggleDay = (day) => {
    setAvail((prev) => {
      if (prev[day] && prev[day].length > 0) {
        const copy = { ...prev }
        delete copy[day]
        return copy
      }
      return {
        ...prev,
        [day]: [{ start: '09:00', end: '18:00' }],
      }
    })
  }

  const addSlotToDay = (day) => {
    setAvail((prev) => {
      const existing = prev[day] || []
      const lastSlot = existing[existing.length - 1]
      const defaultStart = lastSlot?.end || '18:00'
      const defaultEnd = defaultStart === '18:00' ? '21:00' : '22:00'

      return {
        ...prev,
        [day]: [...existing, { start: defaultStart, end: defaultEnd }],
      }
    })
  }

  const removeSlot = (day, slotIndex) => {
    setAvail((prev) => {
      const existing = prev[day] || []
      const updated = existing.filter((_, i) => i !== slotIndex)
      if (updated.length === 0) {
        const copy = { ...prev }
        delete copy[day]
        return copy
      }
      return {
        ...prev,
        [day]: updated,
      }
    })
  }

  const updateSlotTime = (day, slotIndex, field, value) => {
    setAvail((prev) => ({
      ...prev,
      [day]: (prev[day] || []).map((slot, i) =>
        i === slotIndex ? { ...slot, [field]: value } : slot
      ),
    }))
  }

  // ── Availability Presets ───────────────────────────────────────────
  const applyPreset = (type) => {
    if (type === 'weekdays-day') {
      const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
      const updated = { ...avail }
      weekdays.forEach((day) => {
        updated[day] = [{ start: '09:00', end: '17:00' }]
      })
      setAvail(updated)
      notify.info('Applied 9:00 AM – 5:00 PM for all weekdays.')
    } else if (type === 'evenings') {
      const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
      const updated = { ...avail }
      weekdays.forEach((day) => {
        updated[day] = [{ start: '18:00', end: '22:00' }]
      })
      setAvail(updated)
      notify.info('Applied 6:00 PM – 10:00 PM for all weekdays.')
    } else if (type === 'weekends') {
      const weekends = ['Sat', 'Sun']
      const updated = { ...avail }
      weekends.forEach((day) => {
        updated[day] = [{ start: '10:00', end: '18:00' }]
      })
      setAvail(updated)
      notify.info('Applied 10:00 AM – 6:00 PM for weekends.')
    } else if (type === '24-7') {
      const updated = {}
      DAYS_OF_WEEK.forEach((day) => {
        updated[day] = [{ start: '00:00', end: '23:59' }]
      })
      setAvail(updated)
      notify.info('Set 24/7 all-day availability.')
    } else if (type === 'clear') {
      setAvail({})
      notify.info('Cleared all availability.')
    }
  }

  const copyMondayToWeekdays = () => {
    const mondaySlots = avail['Mon'] || [{ start: '09:00', end: '18:00' }]
    const weekdays = ['Tue', 'Wed', 'Thu', 'Fri']
    const updated = { ...avail, Mon: mondaySlots }
    weekdays.forEach((day) => {
      updated[day] = JSON.parse(JSON.stringify(mondaySlots))
    })
    setAvail(updated)
    notify.success('Copied Monday slots to Tue, Wed, Thu, and Fri.')
  }

  const tabs = [
    { id: 'info', label: 'Basic Info', icon: User },
    { id: 'skills', label: 'Skills', icon: Award },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
  ]

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-5 max-w-4xl mx-auto min-h-screen space-y-4">
      {/* ── Top Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            to="/profile/me"
            className="h-8 w-8 rounded-xl border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-tight">
              Edit Profile
            </h1>
            <p className="text-xs text-neutral-500">Personal details, skills exchange, and schedule</p>
          </div>
        </div>
      </div>

      {/* ── Segmented Control Tab Bar ──────────────────────────────── */}
      <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={cn(
              'flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all',
              activeTab === id
                ? 'bg-white dark:bg-neutral-800 text-indigo-600 dark:text-indigo-300 shadow-sm border border-neutral-200/80 dark:border-neutral-700/60'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* ── TAB 1: BASIC INFO ──────────────────────────────────────── */}
      {activeTab === 'info' && (
        <div className="card-shine rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
          {/* Avatar Upload */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
            <div className="relative group">
              <Avatar src={avatarPreview || user?.avatar?.url} name={user?.name} size="xl" />
              {/* Camera hover overlay */}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={avatarMutation.isPending}
                className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity text-white disabled:cursor-not-allowed"
              >
                {avatarMutation.isPending ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="h-5 w-5" />
                )}
              </button>
            </div>

            <div className="space-y-1.5 text-center sm:text-left flex-1 min-w-0">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Profile Photo</h3>
              <p className="text-xs text-neutral-500">JPG, PNG or WebP. Max 5MB. Photo saves automatically on selection.</p>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

              {avatarMutation.isPending ? (
                <div className="flex items-center gap-1.5 pt-1">
                  <div className="h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-indigo-500 font-semibold">Uploading photo...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => fileRef.current?.click()}
                    className="text-xs h-8"
                  >
                    <Camera className="h-3.5 w-3.5 mr-1.5" />
                    {user?.avatar?.url ? 'Change photo' : 'Choose photo'}
                  </Button>
                  {user?.avatar?.url && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleRemovePhoto}
                      className="text-xs h-8 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                      Remove
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-3.5">
            <Input
              label="Full Name"
              value={basic.name}
              onChange={(e) => setBasic((p) => ({ ...p, name: e.target.value }))}
            />

            <Textarea
              label="Bio"
              rows={3}
              value={basic.bio}
              onChange={(e) => setBasic((p) => ({ ...p, bio: e.target.value }))}
              placeholder="Tell peers what you study, projects you built, or skills you want to learn..."
            />

            <div className="grid sm:grid-cols-2 gap-3">
              <Input
                label="Institution / University"
                placeholder="e.g. IIT Delhi, BITS Pilani"
                value={basic.institution}
                onChange={(e) => setBasic((p) => ({ ...p, institution: e.target.value }))}
              />
              <Input
                label="Location"
                placeholder="e.g. New Delhi, India"
                value={basic.location}
                onChange={(e) => setBasic((p) => ({ ...p, location: e.target.value }))}
              />
            </div>

            <div className="pt-2">
              <Button
                size="sm"
                onClick={() => basicMutation.mutate()}
                loading={basicMutation.isPending}
                className="w-full sm:w-auto text-xs h-9 px-5 font-bold"
              >
                Save basic details
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: SKILLS ──────────────────────────────────────────── */}
      {activeTab === 'skills' && (
        <div className="space-y-4">
          {/* TEACH SKILLS */}
          <div className="card-shine rounded-3xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-1.5">
              <Award className="h-4 w-4 text-indigo-500" />
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white">Skills You Can Teach</h2>
            </div>
            <p className="text-xs text-neutral-500">Skills you are comfortable mentoring or sharing with peers</p>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Python, Figma, React..."
                value={teachInput.skill}
                onChange={(e) => setTeachInput((p) => ({ ...p, skill: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && addTeach()}
                className="flex-1 h-9 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <select
                value={teachInput.level}
                onChange={(e) => setTeachInput((p) => ({ ...p, level: e.target.value }))}
                className="h-9 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-2.5 text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {SKILL_LEVELS.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
              <Button size="sm" onClick={addTeach} type="button" className="h-9 px-3 shrink-0">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-1.5 min-h-[32px] pt-1">
              {teachSkills.length === 0 ? (
                <p className="text-xs text-neutral-500 italic">No teaching skills added yet.</p>
              ) : (
                teachSkills.map((s, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60"
                  >
                    <span>{s.skill}</span>
                    <span className="text-[10px] text-indigo-500 dark:text-indigo-400 capitalize">({s.level})</span>
                    <button
                      type="button"
                      onClick={() => removeTeach(i)}
                      className="text-neutral-400 hover:text-rose-500 transition-colors ml-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))
              )}
            </div>

            <Button
              size="sm"
              onClick={() => skillsMutation.mutate()}
              loading={skillsMutation.isPending}
              className="w-full sm:w-auto text-xs h-8 font-bold"
            >
              Save skills
            </Button>
          </div>

          {/* LEARN SKILLS */}
          <div className="card-shine rounded-3xl p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-emerald-500" />
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white">Skills You Want to Learn</h2>
            </div>
            <p className="text-xs text-neutral-500">Skills you want to learn from peer mentors</p>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Machine Learning, UI/UX, Spanish..."
                value={learnInput.skill}
                onChange={(e) => setLearnInput((p) => ({ ...p, skill: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && addLearn()}
                className="flex-1 h-9 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <select
                value={learnInput.priority}
                onChange={(e) => setLearnInput((p) => ({ ...p, priority: e.target.value }))}
                className="h-9 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-2.5 text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 capitalize"
              >
                <option value="high">High priority</option>
                <option value="medium">Medium priority</option>
                <option value="low">Low priority</option>
              </select>
              <Button size="sm" onClick={addLearn} type="button" className="h-9 px-3 shrink-0">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-1.5 min-h-[32px] pt-1">
              {learnSkills.length === 0 ? (
                <p className="text-xs text-neutral-500 italic">No learning goals added yet.</p>
              ) : (
                learnSkills.map((s, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60"
                  >
                    <span>{s.skill}</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 capitalize">({s.priority})</span>
                    <button
                      type="button"
                      onClick={() => removeLearn(i)}
                      className="text-neutral-400 hover:text-rose-500 transition-colors ml-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))
              )}
            </div>

            <Button
              size="sm"
              onClick={() => skillsMutation.mutate()}
              loading={skillsMutation.isPending}
              className="w-full sm:w-auto text-xs h-8 font-bold"
            >
              Save learning goals
            </Button>
          </div>
        </div>
      )}

      {/* ── TAB 3: SCHEDULE (24-HOUR MULTI-SLOT EDITOR) ───────────── */}
      {activeTab === 'schedule' && (
        <div className="card-shine rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-amber-500" />
                <h2 className="text-sm font-bold text-neutral-900 dark:text-white">Weekly Availability & Multi-Slots</h2>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Choose active days and add multiple morning, afternoon, or night slots
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => availMutation.mutate()}
              loading={availMutation.isPending}
              className="h-8 text-xs font-bold px-4"
            >
              Save schedule
            </Button>
          </div>

          {/* Quick Schedule Presets Toolbar */}
          <div className="p-3 rounded-2xl bg-neutral-100/70 dark:bg-neutral-950/70 border border-neutral-200 dark:border-neutral-800/80 space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
              <span>Quick Schedule Presets</span>
            </div>
            <div className="flex flex-wrap gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => applyPreset('weekdays-day')}
                className="px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 font-semibold hover:border-indigo-500 transition-colors"
              >
                Weekdays (9 AM - 5 PM)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('evenings')}
                className="px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 font-semibold hover:border-indigo-500 transition-colors"
              >
                Evenings (6 PM - 10 PM)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('weekends')}
                className="px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 font-semibold hover:border-indigo-500 transition-colors"
              >
                Weekends (10 AM - 6 PM)
              </button>
              <button
                type="button"
                onClick={() => applyPreset('24-7')}
                className="px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 font-semibold hover:border-indigo-500 transition-colors"
              >
                24/7 Available
              </button>
              <button
                type="button"
                onClick={copyMondayToWeekdays}
                className="px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-300 font-bold hover:bg-indigo-100 transition-colors flex items-center gap-1"
              >
                <Copy className="h-3 w-3" />
                Copy Mon to Weekdays
              </button>
              <button
                type="button"
                onClick={() => applyPreset('clear')}
                className="px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:text-rose-500 font-semibold transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* 7-Day Day Selector Bar */}
          <div className="grid grid-cols-7 gap-1 p-1 rounded-2xl bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800">
            {DAYS_OF_WEEK.map((day) => {
              const isEnabled = avail[day] && avail[day].length > 0
              const slotCount = avail[day]?.length || 0

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={cn(
                    'py-2.5 rounded-xl text-xs font-bold transition-all text-center flex flex-col items-center justify-center gap-0.5',
                    isEnabled
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-200/60 dark:hover:bg-neutral-800/60'
                  )}
                >
                  <span>{day}</span>
                  <span
                    className={cn(
                      'text-[9px] px-1 rounded-full font-bold',
                      isEnabled ? 'bg-indigo-800/80 text-white' : 'text-transparent'
                    )}
                  >
                    {isEnabled ? `${slotCount} ${slotCount === 1 ? 'slot' : 'slots'}` : 'off'}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Day-Wise Multi-Slot Details Container */}
          <div className="space-y-3 pt-1">
            {Object.keys(avail).length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-500 rounded-2xl bg-neutral-50 dark:bg-neutral-950/40 border border-dashed border-neutral-200 dark:border-neutral-800">
                <Clock className="h-7 w-7 mx-auto mb-2 text-neutral-400 opacity-60" />
                <p className="font-bold text-neutral-700 dark:text-neutral-300">No active days selected</p>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Tap any day above or choose a preset to enable availability.
                </p>
              </div>
            ) : (
              DAYS_OF_WEEK.filter((day) => avail[day] && avail[day].length > 0).map((day) => {
                const slots = avail[day] || []

                return (
                  <div
                    key={day}
                    className="p-3.5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-950/60 space-y-2.5 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black px-2.5 py-0.5 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                          {day}
                        </span>
                        <span className="text-xs text-neutral-500 font-medium">
                          {slots.length} time {slots.length === 1 ? 'window' : 'windows'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => addSlotToDay(day)}
                          className="h-7 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 px-2"
                        >
                          <Plus className="h-3.5 w-3.5 mr-1" />
                          Add slot
                        </Button>
                        <button
                          type="button"
                          onClick={() => toggleDay(day)}
                          className="h-7 w-7 rounded-lg flex items-center justify-center text-neutral-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Disable day"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Slot Items */}
                    <div className="space-y-1.5 pl-1">
                      {slots.map((slot, slotIdx) => (
                        <div
                          key={slotIdx}
                          className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 p-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs shadow-xs"
                        >
                          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider pl-1">
                            Slot {slotIdx + 1}
                          </span>

                          <div className="flex items-center gap-2 flex-1 justify-end">
                            {/* Start Time Select */}
                            <select
                              value={slot.start}
                              onChange={(e) => updateSlotTime(day, slotIdx, 'start', e.target.value)}
                              className="h-8 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-2.5 text-xs text-neutral-900 dark:text-neutral-100 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                            >
                              {TIME_SLOTS.map((t) => (
                                <option key={t.value} value={t.value}>
                                  {t.label}
                                </option>
                              ))}
                            </select>

                            <span className="text-neutral-400 text-xs font-medium">to</span>

                            {/* End Time Select */}
                            <select
                              value={slot.end}
                              onChange={(e) => updateSlotTime(day, slotIdx, 'end', e.target.value)}
                              className="h-8 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-2.5 text-xs text-neutral-900 dark:text-neutral-100 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                            >
                              {TIME_SLOTS.map((t) => (
                                <option key={t.value} value={t.value}>
                                  {t.label}
                                </option>
                              ))}
                            </select>

                            {/* Remove single slot */}
                            <button
                              type="button"
                              onClick={() => removeSlot(day, slotIdx)}
                              className="h-7 w-7 rounded-lg flex items-center justify-center text-neutral-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                              title="Delete this slot"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          <div className="pt-2">
            <Button
              size="sm"
              onClick={() => availMutation.mutate()}
              loading={availMutation.isPending}
              className="w-full sm:w-auto text-xs h-9 px-6 font-bold"
            >
              Save schedule
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
