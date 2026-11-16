/*
 * Tests for the application routes in routes/applications.js.
 * Owner: Bertin (#1, #17, #43, #46, #49, #54)
 */
import { expect, use } from 'chai'
import chaiHttp, { request } from 'chai-http'
import app from '../app.js'
import { db, todayString } from '../data/store.js'

use(chaiHttp)

describe('POST /api/applications', () => {
  it('creates the application and responds 201 with it', async () => {
    const res = await request.execute(app).post('/api/applications').send({ company: 'Acme', position: 'Intern' })
    expect(res).to.have.status(201)
    expect(res.body.id).to.match(/^app-/)
    expect(res.body.company).to.equal('Acme')
    expect(res.body.position).to.equal('Intern')
  })

  it('saves the new application first in the list', async () => {
    const count = db.applications.length
    const res = await request.execute(app).post('/api/applications').send({ company: 'Acme', position: 'Intern' })
    expect(db.applications).to.have.length(count + 1)
    expect(db.applications[0].id).to.equal(res.body.id)
  })

  it('fills in defaults for the fields that were left out', async () => {
    const res = await request.execute(app).post('/api/applications').send({ company: 'Acme', position: 'Intern' })
    expect(res.body.status).to.equal('applied')
    expect(res.body.jobType).to.equal('internship')
    expect(res.body.dateApplied).to.equal(todayString())
    expect(res.body.recruiters).to.deep.equal([])
    expect(res.body.resume).to.equal(null)
    expect(res.body.archived).to.equal(false)
    expect(res.body.statusHistory).to.deep.equal([{ status: 'applied', date: todayString() }])
  })

  it('keeps the recruiter contacts and the resume (#49, #54)', async () => {
    const recruiters = [{ name: 'Sam Lee', email: 'sam@acme.example', phone: '555 0100' }]
    const resume = { fileName: 'resume.pdf', uploadedAt: '2026-11-01' }
    const res = await request
      .execute(app)
      .post('/api/applications')
      .send({ company: 'Acme', position: 'Intern', recruiters, resume })
    expect(res.body.recruiters).to.deep.equal(recruiters)
    expect(res.body.resume).to.deep.equal(resume)
  })

  it('removes extra spaces around the company and position', async () => {
    const res = await request.execute(app).post('/api/applications').send({ company: '  Acme ', position: ' Intern  ' })
    expect(res.body.company).to.equal('Acme')
    expect(res.body.position).to.equal('Intern')
  })
})