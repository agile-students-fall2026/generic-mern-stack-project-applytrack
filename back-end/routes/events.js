/*
 * /api/events: deadlines, interviews and follow-ups shown on the Upcoming screen.
 * Owner: Ryan (#74, #76)
 *
 * The data is db.events in data/store.js; see data/events.json for every field.
 */
import { Router } from 'express'
import { db, newId } from '../data/store.js'
import { httpError } from '../middleware/errors.js'
import { isBlank } from '../utils/validation.js'

const router = Router()

const EDITABLE_FIELDS = ['applicationId', 'roundId', 'type', 'title', 'date', 'time', 'notes', 'reminder']

/** The event with this id, or a 404 error when there isn't one */
function findEvent(id) {
  const event = db.events.find((item) => item.id === id)
  if (!event) throw httpError(404, 'Event not found')
  return event
}

/**
 * The interview round an interview event belongs to, as { application, round }, or null.
 * Matches by roundId, or by the same name and date for events made without a roundId
 * (same as findInterviewRoundForEvent in the front-end mockApi.js).
 */
function findRoundForEvent(event) {
  if (event.type !== 'interview' || !event.applicationId) return null
  const application = db.applications.find((item) => item.id === event.applicationId)
  if (!application) return null

  const round =
    application.interviewRounds.find((item) => event.roundId && item.id === event.roundId) ||
    application.interviewRounds.find((item) => item.name === event.title && item.date === event.date)
  return round ? { application, round } : null
}

/**
 * GET /api/events  (#76, front-end: getEvents)
 * Query: ?applicationId=app-1 for only one application's events
 * 200 -> array of events, soonest first (sort by date, then time)
 */
router.get('/', (req, res) => {
  // ?applicationId=app-1 keeps only that application's events
  const { applicationId } = req.query
  const events = db.events.filter((event) => !applicationId || event.applicationId === applicationId)

  //soonest first. 
  events.sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
  res.json(events)
})

/**
 * GET /api/events/:id  (#74, front-end: getEvent)
 * 200 -> the event. 404 not found.
 */
router.get('/:id', (req, res) => {
  res.json(findEvent(req.params.id))
})

/**
 * POST /api/events  (#74, front-end: createEvent)
 * Body: { applicationId, roundId, type, title, date, time, notes, reminder }
 * 201 -> the new event. 400 title or date missing.
 */
router.post('/', (req, res) => {
  const fields = req.body ?? {}
  // Title and date are required; every other field is optional
  if (isBlank(fields.title)) throw httpError(400, 'Title is required')
  if (isBlank(fields.date)) throw httpError(400, 'Date is required')

  // The new event, with a default for every field that was left out (same defaults as createEvent in mockApi.js)
  const event = {
    id: newId('event'),
    applicationId: fields.applicationId || null,
    roundId: fields.roundId || null, // set when InterviewRound.jsx creates the event for an interview round
    type: fields.type || 'deadline',
    title: fields.title.trim(),
    date: fields.date,
    time: fields.time || '',
    notes: fields.notes || '',
    reminder: fields.reminder || { enabled: false, before: '1-day' },
  }

  // GET /api/events sorts by date, so the new event can go at the end
  db.events.push(event)
  res.status(201).json(event)
})

/**
 * PATCH /api/events/:id  (#74, front-end: updateEvent)
 * Body: any of { applicationId, type, title, date, time, notes, reminder }
 * 200 -> the updated event. 404 not found. 400 title or date changed to empty.
 */
router.patch('/:id', (req, res) => {
  const event = findEvent(req.params.id)
  const changes = req.body ?? {}

  // Title and date can be left out, but they can't be changed to empty
  if (changes.title !== undefined && isBlank(changes.title)) throw httpError(400, 'Title is required')
  if (changes.date !== undefined && isBlank(changes.date)) throw httpError(400, 'Date is required')

  // Only copy the fields the Edit form can change, so the id (or anything else) can't be changed by accident
  for (const field of EDITABLE_FIELDS) {
    if (changes[field] !== undefined) event[field] = changes[field]
  }
  event.title = event.title.trim()

  res.json(event)
})

/**
 * DELETE /api/events/:id  (#74, front-end: deleteEvent)
 * Also removes the matching interview round, like the front-end mockApi.js does.
 * 200 -> { ok: true }. 404 not found.
 */
router.delete('/:id', (req, res) => {
  const event = findEvent(req.params.id)

  // An interview event belongs to an interview round on its application, so delete that round too
  const linked = findRoundForEvent(event)
  if (linked) {
    linked.application.interviewRounds = linked.application.interviewRounds.filter((round) => round.id !== linked.round.id)
  }

  // Keep every event except the one being deleted
  db.events = db.events.filter((item) => item.id !== event.id)
  res.json({ ok: true })
})

export default router
