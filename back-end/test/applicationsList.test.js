/*
 * Tests for listing applications: GET /api/applications in routes/applications.js.
 * Owner: Estifanos (#63 filter by status, #18 archive)
 */
import { expect, use } from 'chai'
import chaiHttp, { request } from 'chai-http'
import app from '../app.js'
import { db } from '../data/store.js'

use(chaiHttp)

describe('GET /api/applications', () => {
  it('responds 200 with only the current (not archived) applications', async () => {
    const current = db.applications.filter((application) => !application.archived)
    const res = await request.execute(app).get('/api/applications')
    expect(res).to.have.status(200)
    expect(res.body).to.be.an('array').with.length(current.length)
    expect(res.body.every((application) => !application.archived)).to.equal(true)
  })

  it('returns only archived applications with ?archived=true (#18)', async () => {
    const archived = db.applications.filter((application) => application.archived)
    const res = await request.execute(app).get('/api/applications?archived=true')
    expect(res).to.have.status(200)
    expect(res.body).to.have.length(archived.length)
    expect(res.body.every((application) => application.archived)).to.equal(true)
  })

  it('filters by status with ?status= (#63)', async () => {
    const res = await request.execute(app).get('/api/applications?status=interview')
    expect(res).to.have.status(200)
    expect(res.body).to.not.be.empty
    expect(res.body.every((application) => application.status === 'interview')).to.equal(true)
  })

  it('combines the status and archived filters', async () => {
    const res = await request.execute(app).get('/api/applications?status=rejected&archived=true')
    expect(res).to.have.status(200)
    expect(res.body.every((application) => application.status === 'rejected' && application.archived)).to.equal(true)
  })

  it('responds with an empty list for a status no application has', async () => {
    const res = await request.execute(app).get('/api/applications?status=not-a-status')
    expect(res).to.have.status(200)
    expect(res.body).to.deep.equal([])
  })
})