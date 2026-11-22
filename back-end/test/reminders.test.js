/*
 * Tests for working out which reminders are due: utils/reminders.js.
 * Owner: Estifanos (#75, #100)
 */
import { expect } from 'chai'
import { getDueReminders, parseBefore } from '../utils/reminders.js'

// An interview on Dec 1 at 10:00, reminded 1 day before (from Nov 30 at 10:00)
const interview = {
  id: 'event-a',
  applicationId: 'app-1',
  type: 'interview',
  title: 'Onsite interview',
  date: '2026-12-01',
  time: '10:00',
  reminder: { enabled: true, before: '1-day' },
}

// An offer to answer by Dec 5 (end of day), reminded 2 days before
const withOffer = {
  id: 'app-2',
  company: 'Acme',
  archived: false,
  offer: { respondBy: '2026-12-05', remindBefore: '2-days', decision: 'pending' },
}

describe('parseBefore (#100)', () => {
  it('turns reminder times into milliseconds', () => {
    expect(parseBefore('1-hour')).to.equal(60 * 60 * 1000)
    expect(parseBefore('2-hours')).to.equal(2 * 60 * 60 * 1000)
    expect(parseBefore('2-days')).to.equal(2 * 24 * 60 * 60 * 1000)
    expect(parseBefore('1-week')).to.equal(7 * 24 * 60 * 60 * 1000)
  })

  it('returns null for a value it does not understand', () => {
    expect(parseBefore('soon')).to.equal(null)
    expect(parseBefore(undefined)).to.equal(null)
  })
})

describe('getDueReminders (#75, #100)', () => {
  it('includes an event once its reminder time has come', () => {
    const due = getDueReminders({ events: [interview], now: new Date('2026-11-30T12:00') })
    expect(due).to.have.length(1)
    expect(due[0]).to.include({ kind: 'event', id: 'event-a', title: 'Onsite interview' })
  })

  it('leaves out an event whose reminder time has not come yet', () => {
    const due = getDueReminders({ events: [interview], now: new Date('2026-11-29T12:00') })
    expect(due).to.deep.equal([])
  })

  it('leaves out an event that already happened', () => {
    const due = getDueReminders({ events: [interview], now: new Date('2026-12-01T11:00') })
    expect(due).to.deep.equal([])
  })

  it('leaves out an event whose reminder is turned off', () => {
    const off = { ...interview, reminder: { enabled: false, before: '1-day' } }
    const due = getDueReminders({ events: [off], now: new Date('2026-11-30T12:00') })
    expect(due).to.deep.equal([])
  })

  it('leaves out interviews when interview reminders are off in Notification Settings', () => {
    const due = getDueReminders({
      events: [interview],
      settings: { interviewReminders: false },
      now: new Date('2026-11-30T12:00'),
    })
    expect(due).to.deep.equal([])
  })

  it('includes an offer that still needs an answer, before its respond-by date', () => {
    const due = getDueReminders({ applications: [withOffer], now: new Date('2026-12-04T09:00') })
    expect(due).to.have.length(1)
    expect(due[0]).to.include({ kind: 'offer', applicationId: 'app-2' })
  })

  it('leaves out an offer that was already accepted or declined', () => {
    const decided = { ...withOffer, offer: { ...withOffer.offer, decision: 'accepted' } }
    const due = getDueReminders({ applications: [decided], now: new Date('2026-12-04T09:00') })
    expect(due).to.deep.equal([])
  })

  it('lists the soonest one first', () => {
    const later = { ...interview, id: 'event-b', date: '2026-12-02', time: '09:00', reminder: { enabled: true, before: '2-days' } }
    const due = getDueReminders({ events: [later, interview], now: new Date('2026-11-30T12:00') })
    expect(due.map((item) => item.id)).to.deep.equal(['event-a', 'event-b'])
  })
})