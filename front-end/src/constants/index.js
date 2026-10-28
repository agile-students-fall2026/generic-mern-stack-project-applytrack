/*
 * Shared lists used across the app. Always use these instead of typing the labels by hand,
 * so every screen shows the same wording.
 */

// Recruiting pipeline. `badge` controls how <StatusBadge> looks:
// "subtle" = gray fill, "strong" = solid black/white, "outline" = border only.
export const APPLICATION_STATUSES = [
  { value: 'applied', label: 'Applied', shortLabel: 'Applied', badge: 'subtle' },
  { value: 'online-assessment', label: 'Online Assessment', shortLabel: 'OA', badge: 'subtle' },
  { value: 'recruiter-screen', label: 'Recruiter Screen', shortLabel: 'Recruiter screen', badge: 'subtle' },
  { value: 'interview', label: 'Interview', shortLabel: 'Interview', badge: 'strong' },
  { value: 'offer', label: 'Offer', shortLabel: 'Offer', badge: 'strong' },
  { value: 'rejected', label: 'Rejected', shortLabel: 'Rejected', badge: 'outline' },
]

// Statuses where the recruiting process is over.
export const FINAL_STATUSES = ['offer', 'rejected']

export const JOB_TYPES = [
  { value: 'internship', label: 'Internship' },
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
]

export const EVENT_TYPES = [
  { value: 'deadline', label: 'Deadline' },
  { value: 'interview', label: 'Interview' },
  { value: 'follow-up', label: 'Follow-up' },
  { value: 'other', label: 'Other' },
]

export const REMINDER_OPTIONS = [
  { value: '1-hour', label: '1 hour before' },
  { value: '2-hours', label: '2 hours before' },
  { value: '1-day', label: '1 day before' },
  { value: '2-days', label: '2 days before' },
  { value: '1-week', label: '1 week before' },
]

export const OFFER_DECISIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'declined', label: 'Declined' },
]

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'company', label: 'Company A–Z' },
  { value: 'status', label: 'Status' },
]

export const EXPORT_FORMATS = [
  { value: 'csv', label: 'CSV' },
  { value: 'pdf', label: 'PDF' },
]

/** Look up the full status object for a status value, e.g. getStatus('interview').label */
export function getStatus(value) {
  return APPLICATION_STATUSES.find((status) => status.value === value) ?? APPLICATION_STATUSES[0]
}

/** Look up the label for a value in any of the lists above, e.g. getLabel(JOB_TYPES, 'internship') */
export function getLabel(list, value) {
  return list.find((item) => item.value === value)?.label ?? ''
}
