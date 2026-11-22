/*
 * /api/events: deadlines, interviews and follow-ups shown on the Upcoming screen.
 * Owner: Ryan (#74, #76)
 *
 * The data is db.events in data/store.js; see data/events.json for every field.
 */
import { Router } from 'express'
import { db } from '../data/store.js'
import { httpError, notImplemented } from '../middleware/errors.js'

const router = Router()

/** The event with this id, or a 404 error when there isn't one */
function findEvent(id) {
  const event = db.events.find((item) => item.id === id)
  if (!event) throw httpError(404, 'Event not found')
  return event
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
 * Body: { applicationId, type, title, date, time, notes, reminder }
 * 201 -> the new event. 400 title or date missing.
 */
router.post('/', notImplemented)

/**
 * PATCH /api/events/:id  (#74, front-end: updateEvent)
 * 200 -> the updated event. 404 not found.
 */
router.patch('/:id', notImplemented)

/**
 * DELETE /api/events/:id  (#74, front-end: deleteEvent)
 * Also removes the matching interview round, like the front-end mockApi.js does.
 * 200 -> { ok: true }. 404 not found.
 */
router.delete('/:id', notImplemented)

export default router
