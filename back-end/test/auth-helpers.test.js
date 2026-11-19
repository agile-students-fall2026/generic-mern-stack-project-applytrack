/*
 * Tests for utils/auth.js and utils/validation.js (#8, #9).
 */
import { expect } from 'chai'
import { db } from '../data/store.js'
import { findUserByEmail, hashPassword, normalizeEmail, passwordMatches, toPublicUser } from '../utils/auth.js'
import { isBlank, isValidEmail, isValidPassword } from '../utils/validation.js'

describe('utils/auth.js', () => {
  it('hashes a password so the original is not stored, and can check it later', async () => {
    const hash = await hashPassword('correct horse')
    expect(hash).to.not.include('correct horse')
    expect(await passwordMatches('correct horse', hash)).to.equal(true)
    expect(await passwordMatches('wrong horse', hash)).to.equal(false)
  })

  it('the demo user password matches its stored hash', async () => {
    expect(await passwordMatches('password123', db.users[0].passwordHash)).to.equal(true)
  })

  it('toPublicUser() leaves out the password hash', () => {
    const user = toPublicUser(db.users[0])
    expect(user).to.not.have.property('passwordHash')
    expect(user.email).to.equal(db.users[0].email)
    expect(db.users[0]).to.have.property('passwordHash') // the stored user is unchanged
  })

  it('finds users by email, ignoring case and spaces', () => {
    expect(normalizeEmail('  Alex@Example.COM ')).to.equal('alex@example.com')
    expect(findUserByEmail(' ALEX.MORGAN@university.example ')).to.equal(db.users[0])
    expect(findUserByEmail('nobody@example.com')).to.equal(undefined)
  })
})

describe('utils/validation.js', () => {
  it('isBlank() is true for missing, non-text and whitespace-only values', () => {
    expect(isBlank(undefined)).to.equal(true)
    expect(isBlank(42)).to.equal(true)
    expect(isBlank('   ')).to.equal(true)
    expect(isBlank('x')).to.equal(false)
  })

  it('isValidEmail() accepts real-looking emails only', () => {
    expect(isValidEmail('a@b.co')).to.equal(true)
    expect(isValidEmail('not-an-email')).to.equal(false)
    expect(isValidEmail('')).to.equal(false)
  })

  it('isValidPassword() needs at least 8 characters', () => {
    expect(isValidPassword('12345678')).to.equal(true)
    expect(isValidPassword('1234567')).to.equal(false)
    expect(isValidPassword(undefined)).to.equal(false)
  })
})
