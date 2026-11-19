/*
 * Tests for middleware/requireAuth.js: private routes need a valid login token (#19).
 */
import { expect, use } from 'chai'
import chaiHttp, { request } from 'chai-http'
import jwt from 'jsonwebtoken'
import app from '../app.js'
import { db } from '../data/store.js'
import { authHeader } from './helpers.js'

use(chaiHttp)

// Any private route works for these tests; this one creates an application when allowed in.
const privateRequest = () => request.execute(app).post('/api/applications').send({ company: 'Acme', position: 'Intern' })

describe('requireAuth (protecting private routes)', () => {
  it('lets a request with a valid token through', async () => {
    const res = await privateRequest().set(authHeader())
    expect(res).to.have.status(201)
  })

  it('responds 401 when there is no token', async () => {
    const res = await privateRequest()
    expect(res).to.have.status(401)
    expect(res.body.error).to.equal('Please log in to continue')
  })

  it('responds 401 for a made-up token', async () => {
    const res = await privateRequest().set('Authorization', 'Bearer not-a-real-token')
    expect(res).to.have.status(401)
  })

  it('responds 401 for a token signed with a different secret', async () => {
    const forged = jwt.sign({ userId: db.users[0].id }, 'someone-elses-secret')
    const res = await privateRequest().set('Authorization', `Bearer ${forged}`)
    expect(res).to.have.status(401)
  })

  it('responds 401 when the token is not sent as "Bearer <token>"', async () => {
    const token = authHeader().Authorization.split(' ')[1]
    const res = await privateRequest().set('Authorization', token)
    expect(res).to.have.status(401)
  })

  it('responds 401 when the user in the token no longer exists', async () => {
    const header = authHeader()
    db.users = []
    const res = await privateRequest().set(header)
    expect(res).to.have.status(401)
  })

  it('does not run the route when the request is refused', async () => {
    const count = db.applications.length
    await privateRequest()
    expect(db.applications).to.have.length(count)
  })
})
