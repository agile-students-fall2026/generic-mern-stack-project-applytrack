/*
 * Tests for the Stats screen numbers: GET /api/statistics in routes/statistics.js.
 * Owner: Ryan (#77)
 */
import { expect, use } from 'chai'
import chaiHttp, { request } from 'chai-http'
import app from '../app.js'
import { db } from '../data/store.js'
import { authHeader } from './helpers.js'

use(chaiHttp)

/** A small application with only the fields the statistics use. */
function makeApplication(status, archived = false) {
  return { id: `app-${status}-${Math.random()}`, company: 'Test Co', position: 'Intern', status, archived }
}

/** GET /api/statistics as the demo user. */
function getStatistics() {
  return request.execute(app).get('/api/statistics').set(authHeader())
}

describe('GET /api/statistics (#77)', () => {
  it('responds 401 when not logged in', async () => {
    const res = await request.execute(app).get('/api/statistics')
    expect(res).to.have.status(401)
  })

  it('responds with every number the Stats screen needs', async () => {
    const res = await getStatistics()
    expect(res).to.have.status(200)
    expect(res.body).to.have.all.keys(
      'totalApplied',
      'active',
      'interviews',
      'offers',
      'rejections',
      'responseRate',
      'countByStatus',
    )
  })

  it('counts the starting data correctly', async () => {
    const res = await getStatistics()
    expect(res.body.totalApplied).to.equal(10)
    expect(res.body.active).to.equal(7)
    expect(res.body.interviews).to.equal(5)
    expect(res.body.offers).to.equal(2)
    expect(res.body.rejections).to.equal(1)
    expect(res.body.responseRate).to.equal(80)
  })

  it('counts each status', async () => {
    db.applications = [
      makeApplication('applied'),
      makeApplication('applied'),
      makeApplication('online-assessment'),
      makeApplication('recruiter-screen'),
      makeApplication('interview'),
      makeApplication('offer'),
      makeApplication('rejected'),
    ]
    const res = await getStatistics()
    expect(res.body.totalApplied).to.equal(7)
    expect(res.body.offers).to.equal(1)
    expect(res.body.rejections).to.equal(1)
    expect(res.body.countByStatus).to.deep.equal({
      applied: 2,
      'online-assessment': 1,
      'recruiter-screen': 1,
      interview: 1,
      offer: 1,
      rejected: 1,
    })
  })

  it('leaves archived applications out of every number', async () => {
    db.applications = [
      makeApplication('applied'),
      makeApplication('offer', true),
      makeApplication('rejected', true),
      makeApplication('interview', true),
    ]
    const res = await getStatistics()
    expect(res.body.totalApplied).to.equal(1)
    expect(res.body.offers).to.equal(0)
    expect(res.body.rejections).to.equal(0)
    expect(res.body.interviews).to.equal(0)
    expect(res.body.countByStatus).to.deep.equal({ applied: 1 })
  })

  it('counts offers and rejections as no longer active', async () => {
    db.applications = [
      makeApplication('applied'),
      makeApplication('interview'),
      makeApplication('offer'),
      makeApplication('rejected'),
    ]
    const res = await getStatistics()
    expect(res.body.active).to.equal(2)
  })

  it('counts offers as interviews too', async () => {
    db.applications = [makeApplication('interview'), makeApplication('offer'), makeApplication('applied')]
    const res = await getStatistics()
    expect(res.body.interviews).to.equal(2)
  })

  it('counts every status past "applied" as a response', async () => {
    db.applications = [
      makeApplication('applied'),
      makeApplication('online-assessment'),
      makeApplication('recruiter-screen'),
      makeApplication('rejected'),
    ]
    const res = await getStatistics()
    expect(res.body.responseRate).to.equal(75)
  })

  it('rounds the response rate to a whole number', async () => {
    db.applications = [makeApplication('applied'), makeApplication('applied'), makeApplication('interview')]
    const res = await getStatistics()
    expect(res.body.responseRate).to.equal(33) // 1 of 3 = 33.33...%
  })

  it('responds with zeros when there are no applications', async () => {
    db.applications = []
    const res = await getStatistics()
    expect(res).to.have.status(200)
    expect(res.body).to.deep.equal({
      totalApplied: 0,
      active: 0,
      interviews: 0,
      offers: 0,
      rejections: 0,
      responseRate: 0,
      countByStatus: {},
    })
  })

  it('updates after an application is archived', async () => {
    const before = await getStatistics()
    const application = db.applications.find((item) => !item.archived)
    await request.execute(app).post(`/api/applications/${application.id}/archive`).set(authHeader())

    const after = await getStatistics()
    expect(after.body.totalApplied).to.equal(before.body.totalApplied - 1)
    expect(after.body.countByStatus[application.status] ?? 0).to.equal(
      before.body.countByStatus[application.status] - 1,
    )
  })
})
