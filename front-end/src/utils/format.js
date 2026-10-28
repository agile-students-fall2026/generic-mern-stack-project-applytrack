/*
 * Formatting helpers so dates and times look the same on every screen.
 * Dates are stored as "YYYY-MM-DD" strings and times as "HH:MM" (24-hour) strings.
 */

// Parse "YYYY-MM-DD" as a local date (new Date("2026-10-18") would be treated as UTC midnight
// and can show up as the previous day in US time zones).
export function parseDate(value) {
  if (!value) return null
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/** "2026-10-18" -> "Oct 18, 2026" */
export function formatDate(value) {
  const date = parseDate(value)
  if (!date) return ''
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/** "2026-10-18" -> "Oct 18" */
export function formatShortDate(value) {
  const date = parseDate(value)
  if (!date) return ''
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/** "2026-10-18" -> { month: "OCT", day: "18" }, for calendar-style date tiles */
export function formatDateTile(value) {
  const date = parseDate(value)
  if (!date) return { month: '', day: '' }
  return {
    month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
    day: String(date.getDate()),
  }
}

/** "14:30" -> "2:30 PM" */
export function formatTime(value) {
  if (!value) return ''
  const [hours, minutes] = value.split(':').map(Number)
  const date = new Date()
  date.setHours(hours, minutes, 0, 0)
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

/** Today's date as "YYYY-MM-DD" */
export function todayString() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

/** True if a "YYYY-MM-DD" date is before today */
export function isPast(value) {
  return Boolean(value) && value < todayString()
}
