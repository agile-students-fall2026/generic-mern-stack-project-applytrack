/*
 * Runs before every private route (see app.js) and sets req.user to the logged-in user.  (#19)
 *
 * The browser sends the login token from sign up / log in in a header on every request:
 *   Authorization: Bearer <token>
 * No token, a fake or expired one, or one that was logged out -> 401, and the route never runs.
 */
import { db } from '../data/store.js'
import { readToken } from '../utils/auth.js'
import { httpError } from './errors.js'

/** The token from the "Authorization: Bearer <token>" header, or null. */
export function getTokenFromRequest(req) {
  const [type, token] = (req.get('Authorization') ?? '').split(' ')
  return type === 'Bearer' && token ? token : null
}

export function requireAuth(req, res, next) {
  const userId = readToken(getTokenFromRequest(req))
  const user = userId && db.users.find((item) => item.id === userId)
  // The user may be gone even with a valid token, e.g. right after deleting the account.
  if (!user) return next(httpError(401, 'Please log in to continue'))
  req.user = user
  next()
}
