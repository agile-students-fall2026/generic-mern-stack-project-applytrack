/*
 * Tests for the notification settings routes in routes/users.js.
 * Owner: Estifanos (#75)
 */
import { expect, use } from 'chai'
import chaiHttp, { request } from 'chai-http'
import app from '../app.js'
import { db } from '../data/store.js'
import { authHeader } from './helpers.js'

use(chaiHttp)

const ROUTE = '/api/users/me/notification-settings'

describe('GET /api/users/me/notification-settings (#75)', () => {
  it("responds 200 with the logged-in user's settings", async () => {
    const res = await request.execute(app).get(ROUTE).set(authHeader())
    expect(res).to.have.status(200)
    expect(res.body).to.deep.equal(db.users[0].notificationSettings)
  })

  it('responds 401 when not logged in', async () => {
    const res = await request.execute(app).get(ROUTE)
    expect(res).to.have.status(401)
  })
})

describe('PATCH /api/users/me/notification-settings (#75)', () => {
  it('changes the settings that were sent and keeps the rest', async () => {
    const before = { ...db.users[0].notificationSettings }
    const res = await request
      .execute(app)
      .patch(ROUTE)
      .set(authHeader())
      .send({ interviewReminders: false, defaultReminder: '2-days' })
    expect(res).to.have.status(200)
    expect(res.body.interviewReminders).to.equal(false)
    expect(res.body.defaultReminder).to.equal('2-days')
    expect(res.body.deadlineReminders).to.equal(before.deadlineReminders)
  })

  it('saves the change, so the next GET returns it', async () => {
    await request.execute(app).patch(ROUTE).set(authHeader()).send({ followUpReminders: false })
    const res = await request.execute(app).get(ROUTE).set(authHeader())
    expect(res.body.followUpReminders).to.equal(false)
  })

  it('responds 400 when a switch is not true or false, and changes nothing', async () => {
    const before = { ...db.users[0].notificationSettings }
    const res = await request
      .execute(app)
      .patch(ROUTE)
      .set(authHeader())
      .send({ deadlineReminders: 'yes', defaultReminder: '2-days' })
    expect(res).to.have.status(400)
    expect(db.users[0].notificationSettings).to.deep.equal(before)
  })

  it('responds 400 when the default reminder is empty', async () => {
    const res = await request.execute(app).patch(ROUTE).set(authHeader()).send({ defaultReminder: '  ' })
    expect(res).to.have.status(400)
  })

  it('ignores fields that are not notification settings', async () => {
    const res = await request.execute(app).patch(ROUTE).set(authHeader()).send({ passwordHash: 'hacked' })
    expect(res).to.have.status(200)
    expect(res.body).to.not.have.property('passwordHash')
    expect(db.users[0].passwordHash).to.not.equal('hacked')
  })

  it('responds 401 when not logged in', async () => {
    const res = await request.execute(app).patch(ROUTE).send({ interviewReminders: false })
    expect(res).to.have.status(401)
  })
})