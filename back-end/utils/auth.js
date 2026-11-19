/*
 * Helpers for accounts and logging in: password hashing and login tokens.
 */
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from '../data/store.js'

const HASH_ROUNDS = 10 // how much work bcrypt does per hash; 10 is the usual default
const TOKEN_LIFETIME = '7d' // how long you stay logged in

// The secret that signs login tokens. It must come from .env so nobody can make their own tokens.
function getTokenSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET
  if (process.env.NODE_ENV === 'production') throw new Error('JWT_SECRET is missing from .env')
  return 'development-only-secret' // fine on your own computer; never used once deployed
}

/** Scramble a password so it can be stored. The original can't be recovered from the hash. */
export function hashPassword(password) {
  return bcrypt.hash(password, HASH_ROUNDS)
}

/** True if `password` is the one that produced `hash`. */
export function passwordMatches(password, hash) {
  return bcrypt.compare(password, hash)
}

/** A copy of the user that is safe to send to the browser (no password hash). */
export function toPublicUser(user) {
  const publicUser = { ...user }
  delete publicUser.passwordHash
  return publicUser
}

/** Emails are compared without caring about upper/lower case or spaces around them. */
export function normalizeEmail(email) {
  return String(email ?? '').trim().toLowerCase()
}

/** The user with this email, or undefined. */
export function findUserByEmail(email) {
  return db.users.find((user) => normalizeEmail(user.email) === normalizeEmail(email))
}

/**
 * A login token: a signed note saying "this is user X", valid for TOKEN_LIFETIME.
 * The browser sends it back with every request (see middleware/requireAuth.js).
 */
export function createToken(user) {
  return jwt.sign({ userId: user.id }, getTokenSecret(), { expiresIn: TOKEN_LIFETIME })
}

/** The user id inside a token, or null if the token is fake, changed, expired or logged out. */
export function readToken(token) {
  if (!token || db.loggedOutTokens.includes(token)) return null
  try {
    return jwt.verify(token, getTokenSecret()).userId
  } catch {
    return null
  }
}
