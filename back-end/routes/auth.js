/*
 * /api/auth: sign up, log in, log out and password reset. Public: no login needed.
 * Owner: Kumneger (#6, #11, #58)
 */
import { Router } from 'express'
import { db, newId } from '../data/store.js'
import { httpError, notImplemented } from '../middleware/errors.js'
import { getTokenFromRequest } from '../middleware/requireAuth.js'
import { createToken, findUserByEmail, hashPassword, normalizeEmail, passwordMatches, readToken, toPublicUser } from '../utils/auth.js'
import { isBlank, isValidEmail, isValidPassword, MIN_PASSWORD_LENGTH } from '../utils/validation.js'

const router = Router()

const DEFAULT_NOTIFICATION_SETTINGS = {
  deadlineReminders: true,
  interviewReminders: true,
  followUpReminders: true,
  defaultReminder: '1-day',
}

/**
 * POST /api/auth/signup  (#8, #9, #10, front-end: signUp)
 * Body: { fullName, email, password }
 * 201 -> { user, token }: the new user (never the password) and a login token, so they're logged in right away.
 * 400 invalid input, 409 email already used.
 */
router.post('/signup', async (req, res) => {
  const { fullName, email, password } = req.body ?? {}

  // #9: check the input before creating anything
  if (isBlank(fullName)) throw httpError(400, 'Full name is required')
  if (!isValidEmail(email)) throw httpError(400, 'Enter a valid email address')
  if (!isValidPassword(password)) throw httpError(400, `Use at least ${MIN_PASSWORD_LENGTH} characters for your password`)
  if (findUserByEmail(email)) throw httpError(409, 'An account with this email already exists')

  // #8: save the account with a hashed password, never the password itself
  const user = {
    id: newId('user'),
    fullName: fullName.trim(),
    email: email.trim(),
    passwordHash: await hashPassword(password),
    avatarUrl: `https://picsum.photos/seed/${encodeURIComponent(normalizeEmail(email))}/200/200`,
    notificationSettings: { ...DEFAULT_NOTIFICATION_SETTINGS },
  }
  db.users.push(user)

  // #10: the new account is logged in straight away
  res.status(201).json({ user: toPublicUser(user), token: createToken(user) })
})

/**
 * POST /api/auth/login  (#13, front-end: logIn)
 * Body: { email, password }
 * 200 -> { user, token }. 400 missing email or password, 401 wrong email or password.
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body ?? {}
  if (isBlank(email) || isBlank(password)) throw httpError(400, 'Enter your email and password')

  const user = findUserByEmail(email)
  // Same message whether the email or the password is wrong, so nobody can find out which emails have accounts.
  if (!user || !(await passwordMatches(password, user.passwordHash))) {
    throw httpError(401, 'Incorrect email or password')
  }

  res.json({ user: toPublicUser(user), token: createToken(user) })
})

/**
 * POST /api/auth/logout  (#14, front-end: logOut)
 * Send the login token in the Authorization header, like a private route.
 * 200 -> { ok: true }. That token stops working, even if someone copied it.
 */
router.post('/logout', (req, res) => {
  const token = getTokenFromRequest(req)
  if (readToken(token)) db.loggedOutTokens.push(token)
  res.json({ ok: true })
})

/**
 * POST /api/auth/forgot-password  (#61, front-end: requestPasswordReset)
 * Body: { email }
 * 200 -> { ok: true } whether or not the email has an account (don't reveal which emails exist).
 */
router.post('/forgot-password', notImplemented)

/**
 * POST /api/auth/reset-password  (#61, front-end: resetPassword)
 * Body: { token, newPassword }
 * 200 -> { ok: true }. 400 the reset link is invalid or expired.
 */
router.post('/reset-password', notImplemented)

export default router
