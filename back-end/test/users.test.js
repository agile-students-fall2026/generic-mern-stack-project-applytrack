/*
 * Tests for the account routes in /api/users/me (#36, #37, #38).
 */
import { expect, use } from 'chai'
import chaiHttp, { request } from 'chai-http'
import app from '../app.js'
import { db } from '../data/store.js'
import { authHeader } from './helpers.js'

use(chaiHttp)

const api = () => request.execute(app)

describe('GET /api/users/me', () => {
  it('returns the logged-in user without the password hash (#36)', async () => {
    const res = await api().get('/api/users/me').set(authHeader())
    expect(res).to.have.status(200)
    expect(res.body).to.include({ id: 'user-1', fullName: 'Alex Morgan' })
    expect(res.body).to.not.have.property('passwordHash')
  })

  it('needs a login', async () => {
    const res = await api().get('/api/users/me')
    expect(res).to.have.status(401)
  })
})

describe('PATCH /api/users/me', () => {
  it('updates the name, email and photo (#37)', async () => {
    const res = await api()
      .patch('/api/users/me')
      .set(authHeader())
      .send({ fullName: '  Alex M. ', email: 'alex@new.example', avatarUrl: 'data:image/jpeg;base64,abc' })
    expect(res).to.have.status(200)
    expect(res.body).to.include({ fullName: 'Alex M.', email: 'alex@new.example', avatarUrl: 'data:image/jpeg;base64,abc' })
    expect(db.users[0].email).to.equal('alex@new.example')
  })

  it('only changes the fields that were sent', async () => {
    const res = await api().patch('/api/users/me').set(authHeader()).send({ fullName: 'Alex M.' })
    expect(res.body.email).to.equal('alex.morgan@university.example')
  })

  it('rejects an empty name or invalid email, and changes nothing', async () => {
    const emptyName = await api().patch('/api/users/me').set(authHeader()).send({ fullName: ' ', email: 'ok@example.com' })
    expect(emptyName).to.have.status(400)
    expect(db.users[0].email).to.equal('alex.morgan@university.example')

    const badEmail = await api().patch('/api/users/me').set(authHeader()).send({ email: 'nope' })
    expect(badEmail).to.have.status(400)
  })

  it("rejects another account's email but allows keeping your own", async () => {
    const signup = await api().post('/api/auth/signup').send({ fullName: 'Sam', email: 'sam@example.com', password: 'longenough' })
    const samHeader = { Authorization: `Bearer ${signup.body.token}` }

    const taken = await api().patch('/api/users/me').set(samHeader).send({ email: 'ALEX.MORGAN@university.example' })
    expect(taken).to.have.status(409)

    const own = await api().patch('/api/users/me').set(samHeader).send({ email: 'Sam@Example.com' })
    expect(own).to.have.status(200)
  })
})

describe('PATCH /api/users/me/password', () => {
  it('changes the password when the current one is right (#37)', async () => {
    const res = await api()
      .patch('/api/users/me/password')
      .set(authHeader())
      .send({ currentPassword: 'password123', newPassword: 'brand-new-pass' })
    expect(res).to.have.status(200)

    const oldLogin = await api().post('/api/auth/login').send({ email: 'alex.morgan@university.example', password: 'password123' })
    const newLogin = await api().post('/api/auth/login').send({ email: 'alex.morgan@university.example', password: 'brand-new-pass' })
    expect(oldLogin).to.have.status(401)
    expect(newLogin).to.have.status(200)
  })

  it('rejects a wrong current password', async () => {
    const res = await api()
      .patch('/api/users/me/password')
      .set(authHeader())
      .send({ currentPassword: 'wrong-password', newPassword: 'brand-new-pass' })
    expect(res).to.have.status(400)
    expect(res.body.error).to.equal('Current password is incorrect')
  })

  it('rejects a new password that is too short', async () => {
    const res = await api().patch('/api/users/me/password').set(authHeader()).send({ currentPassword: 'password123', newPassword: 'short' })
    expect(res).to.have.status(400)
    expect(res.body.error).to.include('8 characters')
  })
})

describe('DELETE /api/users/me', () => {
  it('removes the account and logs the user out (#38)', async () => {
    const header = authHeader()
    const res = await api().delete('/api/users/me').set(header)
    expect(res).to.have.status(200)
    expect(db.users.find((user) => user.id === 'user-1')).to.equal(undefined)

    const afterwards = await api().get('/api/users/me').set(header)
    expect(afterwards).to.have.status(401)

    const login = await api().post('/api/auth/login').send({ email: 'alex.morgan@university.example', password: 'password123' })
    expect(login).to.have.status(401)
  })
})
