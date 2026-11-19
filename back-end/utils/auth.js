/*
 * Helpers for accounts and logging in: password hashing and login tokens.
 */
import bcrypt from 'bcryptjs'
import { db } from '../data/store.js'

const HASH_ROUNDS = 10 // how much work bcrypt does per hash; 10 is the usual default

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
