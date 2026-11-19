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

describe('POST /api/auth/login', () => {
  it('logs in with the right email and password (#13)', async () => {
    const res = await request.execute(app).post('/api/auth/login').send(DEMO)
    expect(res).to.have.status(200)
    expect(res.body.user.email).to.equal(DEMO.email)
    expect(res.body.user).to.not.have.property('passwordHash')
    expect(res.body.token).to.be.a('string')
  })

  it('accepts the email in any case', async () => {
    const res = await request.execute(app).post('/api/auth/login').send({ ...DEMO, email: 'Alex.Morgan@University.example' })
    expect(res).to.have.status(200)
  })

  it('a new account can log in with the details it signed up with (#10)', async () => {
    await request.execute(app).post('/api/auth/signup').send(NEW_USER)
    const res = await request.execute(app).post('/api/auth/login').send({ email: NEW_USER.email, password: NEW_USER.password })
    expect(res).to.have.status(200)
    expect(res.body.user.fullName).to.equal(NEW_USER.fullName)
  })

  it('rejects a wrong password or unknown email with the same message', async () => {
    const wrongPassword = await request.execute(app).post('/api/auth/login').send({ ...DEMO, password: 'nope-nope' })
    const unknownEmail = await request.execute(app).post('/api/auth/login').send({ ...DEMO, email: 'nobody@example.com' })
    expect(wrongPassword).to.have.status(401)
    expect(unknownEmail).to.have.status(401)
    expect(wrongPassword.body.error).to.equal('Incorrect email or password')
    expect(unknownEmail.body.error).to.equal(wrongPassword.body.error)
  })

  it('rejects a missing email or password', async () => {
    const res = await request.execute(app).post('/api/auth/login').send({ email: DEMO.email })
    expect(res).to.have.status(400)
  })
})

describe('POST /api/auth/logout', () => {
  async function logIn() {
    const res = await request.execute(app).post('/api/auth/login').send(DEMO)
    return { Authorization: `Bearer ${res.body.token}` }
  }

  it('ends the session: the token no longer opens private routes (#14)', async () => {
    const header = await logIn()
    const before = await request.execute(app).get('/api/users/me').set(header)
    expect(before).to.not.have.status(401)

    const res = await request.execute(app).post('/api/auth/logout').set(header)
    expect(res).to.have.status(200)
    expect(res.body).to.deep.equal({ ok: true })

    const after = await request.execute(app).get('/api/users/me').set(header)
    expect(after).to.have.status(401)
  })

  it('only ends that one session', async () => {
    const first = await logIn()
    const second = await logIn()
    await request.execute(app).post('/api/auth/logout').set(first)
    const res = await request.execute(app).post('/api/applications').set(second).send({ company: 'Acme', position: 'Intern' })
    expect(res).to.have.status(201)
  })

  it('still responds ok without a token', async () => {
    const res = await request.execute(app).post('/api/auth/logout')
    expect(res).to.have.status(200)
  })
})

describe('password reset (#61)', () => {
  async function requestReset(email = DEMO.email) {
    const res = await request.execute(app).post('/api/auth/forgot-password').send({ email })
    return { res, token: res.body.resetUrl && new URL(res.body.resetUrl).searchParams.get('token') }
  }

  it('creates a reset link for an existing account', async () => {
    const { res, token } = await requestReset()
    expect(res).to.have.status(200)
    expect(res.body.resetUrl).to.include('/reset-password?token=')
    expect(token).to.have.length(64)
  })

  it('responds the same way for an email without an account, without a link', async () => {
    const { res } = await requestReset('nobody@example.com')
    expect(res).to.have.status(200)
    expect(res.body).to.deep.equal({ ok: true })
  })

  it('rejects an invalid email', async () => {
    const { res } = await requestReset('not-an-email')
    expect(res).to.have.status(400)
  })

  it('sets the new password with the link, and the user can log in with it', async () => {
    const { token } = await requestReset()
    const res = await request.execute(app).post('/api/auth/reset-password').send({ token, newPassword: 'fresh-password' })
    expect(res).to.have.status(200)

    const login = await request.execute(app).post('/api/auth/login').send({ email: DEMO.email, password: 'fresh-password' })
    expect(login).to.have.status(200)
  })

  it('each link works only once', async () => {
    const { token } = await requestReset()
    await request.execute(app).post('/api/auth/reset-password').send({ token, newPassword: 'fresh-password' })
    const again = await request.execute(app).post('/api/auth/reset-password').send({ token, newPassword: 'another-password' })
    expect(again).to.have.status(400)
  })

  it('a newer link replaces the older one', async () => {
    const { token: oldToken } = await requestReset()
    await requestReset()
    const res = await request.execute(app).post('/api/auth/reset-password').send({ token: oldToken, newPassword: 'fresh-password' })
    expect(res).to.have.status(400)
  })

  it('rejects an expired link', async () => {
    const { token } = await requestReset()
    db.passwordResets[0].expiresAt = Date.now() - 1
    const res = await request.execute(app).post('/api/auth/reset-password').send({ token, newPassword: 'fresh-password' })
    expect(res).to.have.status(400)
    expect(res.body.error).to.include('invalid or has expired')
  })

  it('rejects a made-up link and a short new password', async () => {
    const fake = await request.execute(app).post('/api/auth/reset-password').send({ token: 'made-up', newPassword: 'fresh-password' })
    expect(fake).to.have.status(400)

    const { token } = await requestReset()
    const short = await request.execute(app).post('/api/auth/reset-password').send({ token, newPassword: 'short' })
    expect(short).to.have.status(400)
    expect(short.body.error).to.include('8 characters')
  })
})
