/*
 * Tests for listing applications: GET /api/applications in routes/applications.js.
 * Owner: Estifanos (#63 filter by status, #18 archive)
 */
import { expect, use } from 'chai'
import chaiHttp, { request } from 'chai-http'
import app from '../app.js'
import { db } from '../data/store.js'
import { authHeader } from './helpers.js'

use(chaiHttp)

describe('GET /api/applications', () => {
  it('responds 200 with only the current (not archived) applications', async () => {
    const current = db.applications.filter((application) => !application.archived)
    const res = await request.execute(app).get('/api/applications').set(authHeader())
    expect(res).to.have.status(200)
    expect(res.body).to.be.an('array').with.length(current.length)
    expect(res.body.every((application) => !application.archived)).to.equal(true)
  })

  it('returns only archived applications with ?archived=true (#18)', async () => {
    const archived = db.applications.filter((application) => application.archived)
    const res = await request.execute(app).get('/api/applications?archived=true').set(authHeader())
    expect(res).to.have.status(200)
    expect(res.body).to.have.length(archived.length)
    expect(res.body.every((application) => application.archived)).to.equal(true)
  })

  it('filters by status with ?status= (#63)', async () => {
    const res = await request.execute(app).get('/api/applications?status=interview').set(authHeader())
    expect(res).to.have.status(200)
    expect(res.body).to.not.be.empty
    expect(res.body.every((application) => application.status === 'interview')).to.equal(true)
  })

  it('combines the status and archived filters', async () => {
    const res = await request.execute(app).get('/api/applications?status=rejected&archived=true').set(authHeader())
    expect(res).to.have.status(200)
    expect(res.body.every((application) => application.status === 'rejected' && application.archived)).to.equal(true)
  })

  it('responds with an empty list for a status no application has', async () => {
    const res = await request.execute(app).get('/api/applications?status=not-a-status').set(authHeader())
    expect(res).to.have.status(200)
    expect(res.body).to.deep.equal([])
  })

describe('GET /api/applications/:id', () => {
  it('responds 200 with the application, including its job posting link (#39, #67)', async () => {
    const application = db.applications[0]
    const res = await request.execute(app).get(`/api/applications/${application.id}`).set(authHeader())
    expect(res).to.have.status(200)
    expect(res.body.id).to.equal(application.id)
    expect(res.body.company).to.equal(application.company)
    expect(res.body).to.have.property('jobPostingUrl')
  })

  it('responds 404 when the application does not exist', async () => {
    const res = await request.execute(app).get('/api/applications/app-does-not-exist').set(authHeader())
    expect(res).to.have.status(404)
    expect(res.body.error).to.equal('Application not found')
  })
})})

describe('POST /api/applications/:id/archive and /unarchive (#18)', () => {
  it('archives an application so it moves to the archived list', async () => {
    const application = db.applications.find((item) => !item.archived)
    const res = await request.execute(app).post(`/api/applications/${application.id}/archive`).set(authHeader())
    expect(res).to.have.status(200)
    expect(res.body.archived).to.equal(true)

    const list = await request.execute(app).get('/api/applications').set(authHeader())
    expect(list.body.map((item) => item.id)).to.not.include(application.id)
  })

  it('unarchives an application so it is back in the current list', async () => {
    const application = db.applications.find((item) => item.archived)
    const res = await request.execute(app).post(`/api/applications/${application.id}/unarchive`).set(authHeader())
    expect(res).to.have.status(200)
    expect(res.body.archived).to.equal(false)

    const list = await request.execute(app).get('/api/applications').set(authHeader())
    expect(list.body.map((item) => item.id)).to.include(application.id)
  })

  it('responds 404 when archiving an application that does not exist', async () => {
    const res = await request.execute(app).post('/api/applications/app-does-not-exist/archive').set(authHeader())
    expect(res).to.have.status(404)
  })
})

describe('archiving keeps the application data (#18)', () => {
  it('only changes archived, leaving every other field the same', async () => {
    const application = db.applications.find((item) => !item.archived)
    const before = JSON.parse(JSON.stringify(application))

    await request.execute(app).post(`/api/applications/${application.id}/archive`).set(authHeader())
    const res = await request.execute(app).post(`/api/applications/${application.id}/unarchive`).set(authHeader())

    expect(res.body).to.deep.equal(before)
  })
})

describe('filtering by more than one status (#63)', () => {
  it('returns applications with any of the statuses, separated by commas', async () => {
    const res = await request.execute(app).get('/api/applications?status=applied,interview').set(authHeader())
    expect(res).to.have.status(200)
    expect(res.body).to.not.be.empty
    expect(res.body.every((item) => ['applied', 'interview'].includes(item.status))).to.equal(true)

    const statuses = new Set(res.body.map((item) => item.status))
    expect(statuses.has('applied')).to.equal(true)
    expect(statuses.has('interview')).to.equal(true)
  })

  it('also accepts the status repeated: ?status=applied&status=interview', async () => {
    const res = await request.execute(app).get('/api/applications?status=applied&status=interview').set(authHeader())
    expect(res).to.have.status(200)
    expect(res.body.every((item) => ['applied', 'interview'].includes(item.status))).to.equal(true)
  })

  it('ignores spaces after the commas', async () => {
    const res = await request.execute(app).get('/api/applications?status=applied,%20interview').set(authHeader())
    expect(res.body.some((item) => item.status === 'interview')).to.equal(true)
  })
})