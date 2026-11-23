/*
 * Works out which reminders are due right now (#75, #100).
 * Owner: Estifanos
 *
 * A reminder is due when its "remind me" time has passed but the event itself hasn't happened yet.
 * Sending it (email, text) comes later; this decides WHAT to send and WHEN.
 */

const UNIT_MS = { hour: 60 * 60 * 1000, day: 24 * 60 * 60 * 1000, week: 7 * 24 * 60 * 60 * 1000 }

/** "2-days" -> milliseconds. Returns null for a value it doesn't understand. */
export function parseBefore(before) {
  const match = /^(\d+)-(hour|day|week)s?$/.exec(before ?? '')
  if (!match) return null
  return Number(match[1]) * UNIT_MS[match[2]]
}

// Which notification setting turns each event type's reminders on or off
const SETTING_FOR_TYPE = { deadline: 'deadlineReminders', interview: 'interviewReminders', 'follow-up': 'followUpReminders' }

/** False only when the user turned off reminders for this type in Notification Settings. */
function isTurnedOn(settings, type) {
  const setting = SETTING_FOR_TYPE[type]
  return !setting || settings?.[setting] !== false
}

/**
 * The reminders that are due at `now`, soonest event first.
 * Returns [{ kind: 'event' | 'offer', id, applicationId, title, at, remindAt }]
 */
export function getDueReminders({ events = [], applications = [], settings = {}, now = new Date() }) {
  const due = []

  // Add one reminder if `now` is between its "remind me" time and the moment it happens
  function addIfDue(item, atText, beforeText) {
    const at = new Date(atText)
    const before = parseBefore(beforeText)
    if (Number.isNaN(at.getTime()) || before === null) return
    const remindAt = new Date(at.getTime() - before)
    if (remindAt <= now && now < at) {
      due.push({ ...item, at: at.toISOString(), remindAt: remindAt.toISOString() })
    }
  }

  // Events (deadlines, interviews, follow-ups) with their reminder turned on
  for (const event of events) {
    if (!event.reminder?.enabled || !isTurnedOn(settings, event.type)) continue
    addIfDue(
      { kind: 'event', id: event.id, applicationId: event.applicationId, title: event.title },
      `${event.date}T${event.time || '09:00'}`,
      event.reminder.before,
    )
  }

  // Offers that still need an answer, reminded before their "respond by" date (end of that day)
  for (const application of applications) {
    const offer = application.offer
    if (application.archived || !offer?.respondBy) continue
    if (['accepted', 'declined'].includes(offer.decision) || !isTurnedOn(settings, 'deadline')) continue
    addIfDue(
      { kind: 'offer', id: application.id, applicationId: application.id, title: `Respond to the ${application.company} offer` },
      `${offer.respondBy}T23:59`,
      offer.remindBefore,
    )
  }

  return due.sort((a, b) => a.at.localeCompare(b.at))
}