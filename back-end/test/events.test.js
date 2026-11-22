/*
 * Tests for the event routes in routes/events.js.
 * Owner: Ryan (#74, #76)
 */
import { expect, use } from 'chai'
import chaiHttp, { request } from 'chai-http'
import app from '../app.js'
import { db } from '../data/store.js'
import { authHeader } from './helpers.js'

use(chaiHttp)

/** A small event with only the fields the routes use. */
function makeEvent(id, applicationId, date, time) {
  return { id, applicationId, type: 'deadline', title: 'Test event', date, time, notes: '', reminder: { enabled: false, before: '1-day' } }
}

describe('GET /api/events (#76)', () => {
  // Events are private, like every other route except health and auth
  it('responds 401 when not logged in', async () => {
    const res = await request.execute(app).get('/api/events')
    expect(res).to.have.status(401)
  })

  // The starting data has 6 events
  it('responds 200 with every event', async () => {
    const res = await request.execute(app).get('/api/events').set(authHeader())
    expect(res).to.have.status(200)
    expect(res.body).to.be.an('array').with.length(db.events.length)
  })

  // The Upcoming screen shows the soonest event first
  it('sorts the events by date, soonest first', async () => {
    const res = await request.execute(app).get('/api/events').set(authHeader())
    const ids = res.body.map((event) => event.id)
    expect(ids).to.deep.equal(['event-4', 'event-1', 'event-2', 'event-3', 'event-5', 'event-6'])
  })

  // Two events on the same day are sorted by time
  it('sorts events on the same day by time', async () => {
    db.events = [makeEvent('late', 'app-1', '2026-12-01', '15:00'), makeEvent('early', 'app-1', '2026-12-01', '09:30')]
    const res = await request.execute(app).get('/api/events').set(authHeader())
    expect(res.body.map((event) => event.id)).to.deep.equal(['early', 'late'])
  })

  // Sorting the response must not reorder the stored events
  it("doesn't change the order of the stored events", async () => {
    const before = db.events.map((event) => event.id)
    await request.execute(app).get('/api/events').set(authHeader())
    expect(db.events.map((event) => event.id)).to.deep.equal(before)
  })

  // The application details page only shows that application's events
  it('returns only one application\'s events with ?applicationId', async () => {
    db.events.push(makeEvent('event-extra', 'app-1', '2026-10-01', '08:00'))
    const res = await request.execute(app).get('/api/events').set(authHeader()).query({ applicationId: 'app-1' })
    expect(res).to.have.status(200)
    expect(res.body.map((event) => event.id)).to.deep.equal(['event-extra', 'event-2'])
  })

  // An application with no events gets an empty list, not an error
  it('returns an empty array when the application has no events', async () => {
    const res = await request.execute(app).get('/api/events').set(authHeader()).query({ applicationId: 'app-none' })
    expect(res).to.have.status(200)
    expect(res.body).to.deep.equal([])
  })
})

describe('GET /api/events/:id (#74)', () => {
  it('responds 401 when not logged in', async () => {
    const res = await request.execute(app).get('/api/events/event-2')
    expect(res).to.have.status(401)
  })

  // event-2 is Stripe's onsite interview in the starting data
  it('responds 200 with the event', async () => {
    const res = await request.execute(app).get('/api/events/event-2').set(authHeader())
    expect(res).to.have.status(200)
    expect(res.body).to.deep.equal(db.events.find((event) => event.id === 'event-2'))
  })

  it('responds 404 when there is no event with that id', async () => {
    const res = await request.execute(app).get('/api/events/event-missing').set(authHeader())
    expect(res).to.have.status(404)
    expect(res.body.error).to.equal('Event not found')
  })
})

describe('PATCH /api/events/:id (#74)', () => {
  /** PATCH /api/events/:id as the demo user. */
  function updateEvent(id, changes) {
    return request.execute(app).patch(`/api/events/${id}`).set(authHeader()).send(changes)
  }

  it('responds 401 when not logged in', async () => {
    const res = await request.execute(app).patch('/api/events/event-2').send({ title: 'New title' })
    expect(res).to.have.status(401)
  })

  // The basic case: the changes are in the response and really stored
  it('saves the changes and responds 200 with the updated event', async () => {
    const res = await updateEvent('event-2', { title: 'Final round', date: '2026-11-04', time: '11:00' })
    expect(res).to.have.status(200)
    expect(res.body).to.include({ id: 'event-2', title: 'Final round', date: '2026-11-04', time: '11:00' })
    const stored = db.events.find((event) => event.id === 'event-2')
    expect(stored).to.include({ title: 'Final round', date: '2026-11-04', time: '11:00' })
  })

  // Fields that weren't sent stay the same
  it('keeps the fields that were not sent', async () => {
    const res = await updateEvent('event-2', { notes: 'Bring a notebook.' })
    expect(res.body).to.include({ notes: 'Bring a notebook.', title: 'Onsite interview', type: 'interview', applicationId: 'app-1' })
    expect(res.body.reminder).to.deep.equal({ enabled: true, before: '2-hours' })
  })

  // The Edit page saves the reminder switch and how long before as one object
  it('replaces the reminder', async () => {
    const res = await updateEvent('event-2', { reminder: { enabled: false, before: '1-day' } })
    expect(res.body.reminder).to.deep.equal({ enabled: false, before: '1-day' })
  })

  // The Edit page sends applicationId: null when the event isn't linked to an application
  it('can unlink the event from its application', async () => {
    const res = await updateEvent('event-2', { applicationId: null })
    expect(res.body.applicationId).to.equal(null)
  })

  // InterviewRound.jsx sends roundId so the event stays linked to its interview round
  it('keeps the roundId', async () => {
    const res = await updateEvent('event-2', { roundId: 'round-1' })
    expect(res.body.roundId).to.equal('round-1')
  })

  // Spaces typed by accident before or after the title shouldn't be saved
  it('removes extra spaces around the title', async () => {
    const res = await updateEvent('event-2', { title: '  Final round ' })
    expect(res.body.title).to.equal('Final round')
  })

  // Only the event fields are copied, so the id and unknown fields can't be changed
  it('ignores the id and fields that are not part of an event', async () => {
    const res = await updateEvent('event-2', { id: 'event-hacked', location: 'Room 4', startTime: '09:00' })
    expect(res.body.id).to.equal('event-2')
    expect(res.body).to.not.have.any.keys('location', 'startTime')
    expect(db.events.find((event) => event.id === 'event-hacked')).to.equal(undefined)
  })

  // A required field can't be emptied, and nothing is changed
  it('responds 400 when the title is changed to only spaces', async () => {
    const res = await updateEvent('event-2', { title: '   ', notes: 'Should not be saved' })
    expect(res).to.have.status(400)
    expect(res.body.error).to.equal('Title is required')
    expect(db.events.find((event) => event.id === 'event-2').notes).to.equal('Three back-to-back rounds.')
  })

  it('responds 400 when the date is changed to empty', async () => {
    const res = await updateEvent('event-2', { date: '' })
    expect(res).to.have.status(400)
    expect(res.body.error).to.equal('Date is required')
  })

  it('responds 404 when there is no event with that id', async () => {
    const res = await updateEvent('event-missing', { title: 'New title' })
    expect(res).to.have.status(404)
    expect(res.body.error).to.equal('Event not found')
  })
})

describe('POST /api/events (#74)', () => {
  /** POST /api/events as the demo user. */
  function createEvent(fields) {
    return request.execute(app).post('/api/events').set(authHeader()).send(fields)
  }

  // What the Add Event page sends
  const newEvent = {
    applicationId: 'app-1',
    title: 'Send thank-you email',
    type: 'follow-up',
    date: '2026-11-25',
    time: '09:00',
    reminder: { enabled: true, before: '1-day' },
    notes: 'Mention the system design question.',
  }

  it('responds 401 when not logged in', async () => {
    const res = await request.execute(app).post('/api/events').send(newEvent)
    expect(res).to.have.status(401)
  })

  // The basic case: the event comes back with a new id and every field that was sent
  it('creates the event and responds 201 with it', async () => {
    const res = await createEvent(newEvent)
    expect(res).to.have.status(201)
    expect(res.body.id).to.match(/^event-/)
    expect(res.body).to.deep.include(newEvent)
  })

  // The event is really stored, so the other event routes can find it
  it('saves the new event', async () => {
    const count = db.events.length
    const res = await createEvent(newEvent)
    expect(db.events).to.have.length(count + 1)
    const found = await request.execute(app).get(`/api/events/${res.body.id}`).set(authHeader())
    expect(found.body).to.deep.equal(res.body)
  })

  // Two new events never get the same id
  it('gives each new event a different id', async () => {
    const first = await createEvent(newEvent)
    const second = await createEvent(newEvent)
    expect(first.body.id).to.not.equal(second.body.id)
  })

  // Only title and date are required, so every other field needs a sensible default
  it('fills in defaults for the fields that were left out', async () => {
    const res = await createEvent({ title: 'Apply by', date: '2026-12-01' })
    expect(res.body).to.include({ applicationId: null, roundId: null, type: 'deadline', time: '', notes: '' })
    expect(res.body.reminder).to.deep.equal({ enabled: false, before: '1-day' })
  })

  // InterviewRound.jsx sends roundId so the event is linked to its interview round
  it('keeps the roundId', async () => {
    const res = await createEvent({ applicationId: 'app-1', title: 'Round 2', type: 'interview', date: '2026-11-26', roundId: 'round-9' })
    expect(res.body.roundId).to.equal('round-9')
  })

  // Spaces typed by accident before or after the title shouldn't be saved
  it('removes extra spaces around the title', async () => {
    const res = await createEvent({ ...newEvent, title: '  Send thank-you email ' })
    expect(res.body.title).to.equal('Send thank-you email')
  })

  // The server picks the id, and fields that aren't part of an event aren't saved
  it('ignores a sent id and fields that are not part of an event', async () => {
    const res = await createEvent({ ...newEvent, id: 'event-1', startTime: '09:00', location: 'Room 4' })
    expect(res.body.id).to.not.equal('event-1')
    expect(res.body).to.not.have.any.keys('startTime', 'location')
  })

  // A missing required field is rejected with a clear message, and nothing is saved
  it('responds 400 when the title is missing', async () => {
    const count = db.events.length
    const res = await createEvent({ date: '2026-11-25' })
    expect(res).to.have.status(400)
    expect(res.body.error).to.equal('Title is required')
    expect(db.events).to.have.length(count) // nothing was saved
  })

  // Only spaces counts as empty, so it's rejected too
  it('responds 400 when the title is only spaces', async () => {
    const res = await createEvent({ title: '   ', date: '2026-11-25' })
    expect(res).to.have.status(400)
    expect(res.body.error).to.equal('Title is required')
  })

  it('responds 400 when the date is missing', async () => {
    const count = db.events.length
    const res = await createEvent({ title: 'Send thank-you email' })
    expect(res).to.have.status(400)
    expect(res.body.error).to.equal('Date is required')
    expect(db.events).to.have.length(count)
  })
})

describe('DELETE /api/events/:id (#74)', () => {
  /** DELETE /api/events/:id as the demo user. */
  function deleteEvent(id) {
    return request.execute(app).delete(`/api/events/${id}`).set(authHeader())
  }

  /** The ids of an application's interview rounds. */
  function roundIds(applicationId) {
    return db.applications.find((item) => item.id === applicationId).interviewRounds.map((round) => round.id)
  }

  it('responds 401 when not logged in', async () => {
    const res = await request.execute(app).delete('/api/events/event-1')
    expect(res).to.have.status(401)
  })

  // The basic case: the event is gone and the other events are kept
  it('deletes the event and responds 200 with { ok: true }', async () => {
    const count = db.events.length
    const res = await deleteEvent('event-1')
    expect(res).to.have.status(200)
    expect(res.body).to.deep.equal({ ok: true })
    expect(db.events).to.have.length(count - 1)
    expect(db.events.find((event) => event.id === 'event-1')).to.equal(undefined)
  })

  // After deleting, the event can't be fetched any more
  it('makes GET /api/events/:id respond 404 afterwards', async () => {
    await deleteEvent('event-1')
    const res = await request.execute(app).get('/api/events/event-1').set(authHeader())
    expect(res).to.have.status(404)
  })

  // round-1 is app-1's technical phone screen in the starting data
  it('also deletes the interview round linked by roundId', async () => {
    db.events.push({ ...makeEvent('event-round', 'app-1', '2026-12-01', '10:00'), type: 'interview', roundId: 'round-1' })
    await deleteEvent('event-round')
    expect(roundIds('app-1')).to.deep.equal([])
  })

  // Older interview events have no roundId, so the round is matched by name and date instead
  it('also deletes the interview round with the same name and date', async () => {
    db.events.push({ ...makeEvent('event-round', 'app-1', '2026-10-06', '10:00'), type: 'interview', title: 'Technical phone screen' })
    await deleteEvent('event-round')
    expect(roundIds('app-1')).to.deep.equal([])
  })

  // An interview event that doesn't match any round leaves the rounds alone
  it('keeps the rounds when no round matches the event', async () => {
    db.events.push({ ...makeEvent('event-round', 'app-1', '2026-12-01', '10:00'), type: 'interview', title: 'Something else' })
    await deleteEvent('event-round')
    expect(roundIds('app-1')).to.deep.equal(['round-1'])
  })

  // Only interview events are linked to rounds, so a deadline with a matching name and date keeps the round
  it("doesn't delete a round for events that aren't interviews", async () => {
    db.events.push({ ...makeEvent('event-round', 'app-1', '2026-10-06', '10:00'), title: 'Technical phone screen', roundId: 'round-1' })
    await deleteEvent('event-round')
    expect(roundIds('app-1')).to.deep.equal(['round-1'])
  })

  // An event doesn't have to belong to an application (applicationId: null), and deleting it still works
  it('works when the event has no application', async () => {
    db.events.push({ ...makeEvent('event-alone', null, '2026-12-01', '10:00'), type: 'interview' })
    const res = await deleteEvent('event-alone')
    expect(res).to.have.status(200)
  })

  it('responds 404 when there is no event with that id', async () => {
    const count = db.events.length
    const res = await deleteEvent('event-missing')
    expect(res).to.have.status(404)
    expect(res.body.error).to.equal('Event not found')
    expect(db.events).to.have.length(count) // nothing was deleted
  })
})
