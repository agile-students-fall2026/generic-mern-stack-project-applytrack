/*
 * Tests for saving an offer: PUT /api/applications/:id/offer in routes/applications.js.
 * Owner: Estifanos (#16)
 */
import { expect, use } from 'chai'
import chaiHttp, { request } from 'chai-http'
import app from '../app.js'
import { db } from '../data/store.js'
import { authHeader } from './helpers.js'

use(chaiHttp)

describe('PUT /api/applications/:id/offer (#16)', () => {
  it('saves a new offer on an application that had none', async () => {
    const application = db.applications.find((item) => item.offer === null)
    const res = await request
      .execute(app)
      .put(`/api/applications/${application.id}/offer`)
      .set(authHeader())
      .send({ baseSalary: '$10,000/month', respondBy: '2026-12-01', decision: 'pending' })
    expect(res).to.have.status(200)
    expect(res.body.offer.baseSalary).to.equal('$10,000/month')
    expect(res.body.offer.respondBy).to.equal('2026-12-01')
  })

  it('updates only the fields that were sent and keeps the rest', async () => {
    const application = db.applications.find((item) => item.offer !== null)
    const before = { ...application.offer }
    const res = await request
      .execute(app)
      .put(`/api/applications/${application.id}/offer`)
      .set(authHeader())
      .send({ decision: 'accepted' })
    expect(res.body.offer.decision).to.equal('accepted')
    expect(res.body.offer.baseSalary).to.equal(before.baseSalary)
  })

  it('ignores fields that are not part of an offer', async () => {
    const application = db.applications.find((item) => item.offer === null)
    const res = await request
      .execute(app)
      .put(`/api/applications/${application.id}/offer`)
      .set(authHeader())
      .send({ baseSalary: '$1', archived: true })
    expect(res.body.offer).to.not.have.property('archived')
    expect(res.body.archived).to.equal(false)
  })

  it('responds 404 when the application does not exist', async () => {
    const res = await request
      .execute(app)
      .put('/api/applications/app-does-not-exist/offer')
      .set(authHeader())
      .send({ baseSalary: '$1' })
    expect(res).to.have.status(404)
  })

  it('responds 401 when not logged in', async () => {
    const application = db.applications[0]
    const res = await request
      .execute(app)
      .put(`/api/applications/${application.id}/offer`)
      .send({ baseSalary: '$1' })
    expect(res).to.have.status(401)
  })
})

describe('changing the status keeps the offer (#16)', () => {
  it('keeps the offer details when the status changes away from Offer', async () => {
    const application = db.applications.find((item) => item.offer !== null)
    const offerBefore = { ...application.offer }

    const res = await request
      .execute(app)
      .patch(`/api/applications/${application.id}`)
      .set(authHeader())
      .send({ status: 'interview' })
    expect(res).to.have.status(200)
    expect(res.body.status).to.equal('interview')
    expect(res.body.offer).to.deep.equal(offerBefore)
  })
})