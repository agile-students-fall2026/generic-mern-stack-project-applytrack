/*
 * Shared helpers for tests.
 */
import { db } from '../data/store.js'
import { createToken } from '../utils/auth.js'

/**
 * The header that logs a request in as the demo user (or the given user). Private routes need it:
 *   request.execute(app).get('/api/applications').set(authHeader())
 */
export function authHeader(user = db.users[0]) {
  return { Authorization: `Bearer ${createToken(user)}` }
}
