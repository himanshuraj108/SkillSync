export const SKILL_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
]

export const SKILL_CATEGORIES = [
  { value: 'tech', label: 'Technology' },
  { value: 'design', label: 'Design' },
  { value: 'language', label: 'Languages' },
  { value: 'business', label: 'Business' },
  { value: 'science', label: 'Science' },
  { value: 'other', label: 'Other' },
]

export const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export const TIME_SLOTS = [
  { value: '00:00', label: '12:00 AM (Midnight)' },
  { value: '00:30', label: '12:30 AM' },
  { value: '01:00', label: '01:00 AM' },
  { value: '01:30', label: '01:30 AM' },
  { value: '02:00', label: '02:00 AM' },
  { value: '02:30', label: '02:30 AM' },
  { value: '03:00', label: '03:00 AM' },
  { value: '03:30', label: '03:30 AM' },
  { value: '04:00', label: '04:00 AM' },
  { value: '04:30', label: '04:30 AM' },
  { value: '05:00', label: '05:00 AM' },
  { value: '05:30', label: '05:30 AM' },
  { value: '06:00', label: '06:00 AM' },
  { value: '06:30', label: '06:30 AM' },
  { value: '07:00', label: '07:00 AM' },
  { value: '07:30', label: '07:30 AM' },
  { value: '08:00', label: '08:00 AM' },
  { value: '08:30', label: '08:30 AM' },
  { value: '09:00', label: '09:00 AM' },
  { value: '09:30', label: '09:30 AM' },
  { value: '10:00', label: '10:00 AM' },
  { value: '10:30', label: '10:30 AM' },
  { value: '11:00', label: '11:00 AM' },
  { value: '11:30', label: '11:30 AM' },
  { value: '12:00', label: '12:00 PM (Noon)' },
  { value: '12:30', label: '12:30 PM' },
  { value: '13:00', label: '01:00 PM' },
  { value: '13:30', label: '01:30 PM' },
  { value: '14:00', label: '02:00 PM' },
  { value: '14:30', label: '02:30 PM' },
  { value: '15:00', label: '03:00 PM' },
  { value: '15:30', label: '03:30 PM' },
  { value: '16:00', label: '04:00 PM' },
  { value: '16:30', label: '04:30 PM' },
  { value: '17:00', label: '05:00 PM' },
  { value: '17:30', label: '05:30 PM' },
  { value: '18:00', label: '06:00 PM' },
  { value: '18:30', label: '06:30 PM' },
  { value: '19:00', label: '07:00 PM' },
  { value: '19:30', label: '07:30 PM' },
  { value: '20:00', label: '08:00 PM' },
  { value: '20:30', label: '08:30 PM' },
  { value: '21:00', label: '09:00 PM' },
  { value: '21:30', label: '09:30 PM' },
  { value: '22:00', label: '10:00 PM' },
  { value: '22:30', label: '10:30 PM' },
  { value: '23:00', label: '11:00 PM' },
  { value: '23:30', label: '11:30 PM' },
  { value: '23:59', label: '11:59 PM' },
]

export const SESSION_DURATIONS = [
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
]

export const REPUTATION_TIERS = [
  { min: 0, max: 10, label: 'New', color: 'text-neutral-400', bg: 'bg-neutral-800' },
  { min: 11, max: 30, label: 'Rising', color: 'text-blue-400', bg: 'bg-blue-900/30' },
  { min: 31, max: 60, label: 'Trusted', color: 'text-emerald-400', bg: 'bg-emerald-900/30' },
  { min: 61, max: 85, label: 'Expert', color: 'text-indigo-400', bg: 'bg-indigo-900/30' },
  { min: 86, max: 100, label: 'Elite', color: 'text-amber-400', bg: 'bg-amber-900/30' },
]

export const LEVEL_COLORS = {
  beginner: 'bg-neutral-700 text-neutral-300',
  intermediate: 'bg-blue-900/40 text-blue-300',
  advanced: 'bg-indigo-900/40 text-indigo-300',
  expert: 'bg-amber-900/40 text-amber-300',
}

export function getReputationTier(score = 0) {
  const num = typeof score === 'number' ? score : 0
  return REPUTATION_TIERS.find((t) => num >= t.min && num <= t.max) || REPUTATION_TIERS[0]
}

export const SESSION_STATUS_COLORS = {
  scheduled: 'bg-blue-900/40 text-blue-300',
  live: 'bg-emerald-900/40 text-emerald-300',
  completed: 'bg-neutral-700 text-neutral-400',
  cancelled: 'bg-red-900/40 text-red-300',
  no_show: 'bg-red-900/40 text-red-400',
}

export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'
