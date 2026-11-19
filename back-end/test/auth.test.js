/*
 * Tests for /api/auth: sign up, log in, log out and password reset (#6, #11, #58).
 */
import { expect, use } from 'chai'
import chaiHttp, { request } from 'chai-http'
import app from '../app.js'
import { db } from '../data/store.js'
import { passwordMatches } from '../utils/auth.js'

use(chaiHttp)

const DEMO = { email: 'alex.morgan@university.example', password: 'password123' }
const NEW_USER = { fullName: 'Sam Lee', email: 'sam.lee@example.com', password: 'longenough' }

describe('POST /api/auth/signup', () => {
  it('creates the account and logs the user in (#10)', async () => {
    const res = await request.execute(app).post('/api/auth/signup').send(NEW_USER)
    expect(res).to.have.status(201)
    expect(res.body.user).to.include({ fullName: 'Sam Lee', email: 'sam.lee@example.com' })
    expect(res.body.user).to.not.have.property('passwordHash')
    expect(res.body.token).to.be.a('string')
  })

  it('stores a hash of the password, not the password (#8)', async () => {
    await request.execute(app).post('/api/auth/signup').send(NEW_USER)
    const saved = db.users.find((user) => user.email === NEW_USER.email)
    expect(saved.passwordHash).to.not.equal(NEW_USER.password)
    expect(await passwordMatches(NEW_USER.password, saved.passwordHash)).to.equal(true)
  })

  it('rejects a missing name, an invalid email and a short password (#9)', async () => {
    const missingName = await request.execute(app).post('/api/auth/signup').send({ ...NEW_USER, fullName: '  ' })
    expect(missingName).to.have.status(400)
    expect(missingName.body.error).to.equal('Full name is required')

    const badEmail = await request.execute(app).post('/api/auth/signup').send({ ...NEW_USER, email: 'sam' })
    expect(badEmail).to.have.status(400)
    expect(badEmail.body.error).to.equal('Enter a valid email address')

    const shortPassword = await request.execute(app).post('/api/auth/signup').send({ ...NEW_USER, password: 'short' })
    expect(shortPassword).to.have.status(400)
    expect(shortPassword.body.error).to.include('8 characters')
  })

  it('rejects an email that already has an account, ignoring case (#9)', async () => {
    const res = await request
      .execute(app)
      .post('/api/auth/signup')
      .send({ ...NEW_USER, email: ' ALEX.MORGAN@university.example ' })
    expect(res).to.have.status(409)
    expect(res.body.error).to.equal('An account with this email already exists')
  })

  it('does not save anything when the input is invalid', async () => {
    const count = db.users.length
    await request.execute(app).post('/api/auth/signup').send({})
    expect(db.users).to.have.length(count)
  })
})
