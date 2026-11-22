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
