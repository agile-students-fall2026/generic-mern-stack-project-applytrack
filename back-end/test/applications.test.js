/*
 * Tests for the application routes in routes/applications.js.
 * Owner: Bertin (#1, #17, #43, #46, #49, #54)
 */
import { expect, use } from 'chai'
import chaiHttp, { request } from 'chai-http'
import app from '../app.js'
import { db, todayString } from '../data/store.js'
import { authHeader } from './helpers.js'

use(chaiHttp)

describe('POST /api/applications', () => {
  // The basic case: sending a company and position creates an application with a new id
  it('creates the application and responds 201 with it', async () => {
    const res = await request.execute(app).post('/api/applications').set(authHeader()).send({ company: 'Acme', position: 'Intern' })
    expect(res).to.have.status(201)
    expect(res.body.id).to.match(/^app-/)
    expect(res.body.company).to.equal('Acme')
    expect(res.body.position).to.equal('Intern')
  })

  // The application is really stored, and at the top so the dashboard shows the newest first
  it('saves the new application first in the list', async () => {
    const count = db.applications.length
    const res = await request.execute(app).post('/api/applications').set(authHeader()).send({ company: 'Acme', position: 'Intern' })
    expect(db.applications).to.have.length(count + 1)
    expect(db.applications[0].id).to.equal(res.body.id)
  })

  // Only company and position are required, so every other field needs a sensible default
  it('fills in defaults for the fields that were left out', async () => {
    const res = await request.execute(app).post('/api/applications').set(authHeader()).send({ company: 'Acme', position: 'Intern' })
    expect(res.body.status).to.equal('applied')
    expect(res.body.jobType).to.equal('internship')
    expect(res.body.dateApplied).to.equal(todayString())
    expect(res.body.recruiters).to.deep.equal([])
    expect(res.body.resume).to.equal(null)
    expect(res.body.archived).to.equal(false)
    expect(res.body.statusHistory).to.deep.equal([{ status: 'applied', date: todayString() }])
  })

  // Recruiter contacts (#49) and the resume used (#54) are saved exactly as they were sent
  it('keeps the recruiter contacts and the resume (#49, #54)', async () => {
    const recruiters = [{ name: 'Sam Lee', email: 'sam@acme.example', phone: '555 0100' }]
    const resume = { fileName: 'resume.pdf', uploadedAt: '2026-11-01' }
    const res = await request
      .execute(app)
      .post('/api/applications')
      .set(authHeader())
      .send({ company: 'Acme', position: 'Intern', recruiters, resume })
    expect(res.body.recruiters).to.deep.equal(recruiters)
    expect(res.body.resume).to.deep.equal(resume)
  })

  // Spaces typed by accident before or after the text shouldn't be saved
  it('removes extra spaces around the company and position', async () => {
    const res = await request.execute(app).post('/api/applications').set(authHeader()).send({ company: '  Acme ', position: ' Intern  ' })
    expect(res.body.company).to.equal('Acme')
    expect(res.body.position).to.equal('Intern')
  })

  // A missing required field is rejected with a clear message, and nothing is saved
  it('responds 400 when the company is missing', async () => {
    const count = db.applications.length
    const res = await request.execute(app).post('/api/applications').set(authHeader()).send({ position: 'Intern' })
    expect(res).to.have.status(400)
    expect(res.body.error).to.equal('Company is required')
    expect(db.applications).to.have.length(count) // nothing was saved
  })

  // Only spaces counts as empty, so it's rejected too
  it('responds 400 when the position is only spaces', async () => {
    const res = await request.execute(app).post('/api/applications').set(authHeader()).send({ company: 'Acme', position: '   ' })
    expect(res).to.have.status(400)
    expect(res.body.error).to.equal('Position is required')
  })
})

describe('GET /api/applications/duplicate', () => {
  // Stripe's Software Engineering Intern application (app-1) is in the starting data
  it('returns the application with the same company and position', async () => {
    const res = await request
      .execute(app)
      .get('/api/applications/duplicate')
      .set(authHeader())
      .query({ company: 'Stripe', position: 'Software Engineering Intern' })
    expect(res).to.have.status(200)
    expect(res.body.id).to.equal('app-1')
  })

  // "stripe" and "  Stripe " are the same company, so they still count as a duplicate
  it('ignores upper/lower case and extra spaces', async () => {
    const res = await request
      .execute(app)
      .get('/api/applications/duplicate')
      .set(authHeader())
      .query({ company: '  stripe ', position: 'software  engineering   INTERN' })
    expect(res.body.id).to.equal('app-1')
  })

  // The check also looks at applications added since the server started, not only the starting data
  it('finds an application that was just created', async () => {
    await request
      .execute(app)
      .post('/api/applications')
      .set(authHeader())
      .send({ company: 'Acme', position: 'Intern' })
    const res = await request
      .execute(app)
      .get('/api/applications/duplicate')
      .set(authHeader())
      .query({ company: 'acme', position: 'intern' })
    expect(res.body.company).to.equal('Acme')
  })

  // Same company but a different position is not a duplicate, so the route returns null
  it('returns null when there is no match', async () => {
    const res = await request
      .execute(app)
      .get('/api/applications/duplicate')
      .set(authHeader())
      .query({ company: 'Stripe', position: 'Product Manager' })
    expect(res).to.have.status(200)
    expect(res.body).to.equal(null)
  })

  // The check needs both fields, so a request without one is rejected
  it('responds 400 when the company or position is missing', async () => {
    const noCompany = await request
      .execute(app)
      .get('/api/applications/duplicate')
      .set(authHeader())
      .query({ position: 'Intern' })
    expect(noCompany).to.have.status(400)
    expect(noCompany.body.error).to.equal('Company is required')

    const noPosition = await request
      .execute(app)
      .get('/api/applications/duplicate')
      .set(authHeader())
      .query({ company: 'Stripe' })
    expect(noPosition).to.have.status(400)
    expect(noPosition.body.error).to.equal('Position is required')
  })
})

describe('PATCH /api/applications/:id', () => {
  // The Edit form sends the changed fields, and the response is the updated application
  it('updates the fields that were sent and responds with the application', async () => {
    const res = await request
      .execute(app)
      .patch('/api/applications/app-1')
      .set(authHeader())
      .send({ location: 'Remote', notes: 'Updated notes' })
    expect(res).to.have.status(200)
    expect(res.body.location).to.equal('Remote')
    expect(res.body.notes).to.equal('Updated notes')
    expect(db.applications.find((item) => item.id === 'app-1').location).to.equal('Remote') // really saved
  })

  // Fields that weren't sent stay the same
  it('keeps the fields that were not sent', async () => {
    const res = await request.execute(app).patch('/api/applications/app-1').set(authHeader()).send({ notes: 'Hi' })
    expect(res.body.company).to.equal('Stripe')
    expect(res.body.position).to.equal('Software Engineering Intern')
  })

  // Changing the status adds it to the status history, so the timeline shows when it changed
  it('adds a new status to the status history', async () => {
    const before = db.applications.find((item) => item.id === 'app-1').statusHistory.length
    const res = await request.execute(app).patch('/api/applications/app-1').set(authHeader()).send({ status: 'offer' })
    expect(res.body.status).to.equal('offer')
    expect(res.body.statusHistory).to.have.length(before + 1)
    expect(res.body.statusHistory.at(-1)).to.deep.equal({ status: 'offer', date: todayString() })
  })

  // Saving the form without changing the status shouldn't add a duplicate history entry
  it('does not add to the status history when the status is the same', async () => {
    const application = db.applications.find((item) => item.id === 'app-1')
    const before = application.statusHistory.length
    await request.execute(app).patch('/api/applications/app-1').set(authHeader()).send({ status: application.status })
    expect(application.statusHistory).to.have.length(before)
  })

  // Editing an application that doesn't exist gives a clear 404
  it('responds 404 when the application does not exist', async () => {
    const res = await request.execute(app).patch('/api/applications/app-xyz').set(authHeader()).send({ notes: 'Hi' })
    expect(res).to.have.status(404)
    expect(res.body.error).to.equal('Application not found')
  })

  // Company and position are required, so they can't be changed to empty, and nothing is saved
  it('responds 400 when the company is changed to empty', async () => {
    const res = await request.execute(app).patch('/api/applications/app-1').set(authHeader()).send({ company: '  ' })
    expect(res).to.have.status(400)
    expect(res.body.error).to.equal('Company is required')
    expect(db.applications.find((item) => item.id === 'app-1').company).to.equal('Stripe')
  })

  // The id and status history are managed by the server, so the request can't overwrite them
  it('does not let the request change the id or the status history', async () => {
    const res = await request
      .execute(app)
      .patch('/api/applications/app-1')
      .set(authHeader())
      .send({ id: 'hacked', statusHistory: [] })
    expect(res.body.id).to.equal('app-1')
    expect(res.body.statusHistory).to.not.be.empty
  })
})

describe('DELETE /api/applications/:id', () => {
  // Deleting answers { ok: true } and the application is really gone
  it('deletes the application and responds with ok', async () => {
    const res = await request.execute(app).delete('/api/applications/app-1').set(authHeader())
    expect(res).to.have.status(200)
    expect(res.body).to.deep.equal({ ok: true })
    expect(db.applications.find((item) => item.id === 'app-1')).to.equal(undefined)
  })

  // After deleting, loading the same application gives "not found"
  it('makes the application unavailable afterwards', async () => {
    await request.execute(app).delete('/api/applications/app-1').set(authHeader())
    const res = await request.execute(app).get('/api/applications/app-1').set(authHeader())
    expect(res).to.have.status(404)
  })

  // Deleting an application that doesn't exist gives a clear 404, and nothing is removed
  it('responds 404 when the application does not exist', async () => {
    const count = db.applications.length
    const res = await request.execute(app).delete('/api/applications/app-xyz').set(authHeader())
    expect(res).to.have.status(404)
    expect(res.body.error).to.equal('Application not found')
    expect(db.applications).to.have.length(count)
  })

  // The application's events are deleted with it (app-1 has event-2 in the starting data)
  it('also deletes the events of that application', async () => {
    expect(db.events.some((event) => event.applicationId === 'app-1')).to.equal(true)
    await request.execute(app).delete('/api/applications/app-1').set(authHeader())
    expect(db.events.some((event) => event.applicationId === 'app-1')).to.equal(false)
  })

  // Only the chosen application and its events are deleted; everything else stays
  it('keeps the other applications and their events', async () => {
    const applicationCount = db.applications.length
    const otherEvents = db.events.filter((event) => event.applicationId !== 'app-1').length
    await request.execute(app).delete('/api/applications/app-1').set(authHeader())
    expect(db.applications).to.have.length(applicationCount - 1)
    expect(db.applications.find((item) => item.id === 'app-2')).to.not.equal(undefined)
    expect(db.events).to.have.length(otherEvents)
  })
})