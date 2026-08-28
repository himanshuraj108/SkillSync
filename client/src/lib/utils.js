import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatDate(date, formatStr = 'MMM dd, yyyy') {
  if (!date) return ''
  return format(new Date(date), formatStr)
}

export function formatRelativeTime(date) {
  if (!date) return ''
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function formatDuration(minutes) {
  if (!minutes) return '0h'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0 && mins > 0) return `${hours}h ${mins}m`
  if (hours > 0) return `${hours}h`
  return `${mins}m`
}

export function getInitials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

export function truncateText(text, maxLength) {
  if (!text || text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function debounce(fn, delay) {
  let timeoutId
  return function (...args) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn.apply(this, args), delay)
  }
}

export function formatTimeSlot(timeStr) {
  if (!timeStr) return ''
  const parts = timeStr.split(':')
  if (parts.length < 2) return timeStr
  const h = parseInt(parts[0], 10)
  const m = parseInt(parts[1], 10)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 || 12
  return `${hour12}:${String(m).padStart(2, '0')} ${ampm}`
}

export function formatTimeRange(start, end) {
  if (!start || !end) return ''
  return `${formatTimeSlot(start)} - ${formatTimeSlot(end)}`
}
