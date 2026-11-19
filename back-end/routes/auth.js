/*
 * /api/auth: sign up, log in, log out and password reset. Public: no login needed.
 * Owner: Kumneger (#6, #11, #58)
 */
import { randomBytes } from 'node:crypto'
import { Router } from 'express'
import { db, newId } from '../data/store.js'
import { httpError } from '../middleware/errors.js'
import { getTokenFromRequest } from '../middleware/requireAuth.js'
import { createToken, findUserByEmail, hashPassword, normalizeEmail, passwordMatches, readToken, toPublicUser } from '../utils/auth.js'
import { isBlank, isValidEmail, isValidPassword, MIN_PASSWORD_LENGTH } from '../utils/validation.js'

const router = Router()

const RESET_LINK_LIFETIME_MS = 60 * 60 * 1000 // reset links work for 1 hour

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
 * Creates a one-time reset link that works for RESET_LINK_LIFETIME_MS.
 * No email service yet, so the link is printed in the server's terminal. Outside production the
 * response also includes it as `resetUrl`, so the "Open reset link (demo)" button can use it.
 * 200 -> { ok: true } whether or not the email has an account (don't reveal which emails exist).
 */
router.post('/forgot-password', (req, res) => {
  const { email } = req.body ?? {}
  if (!isValidEmail(email)) throw httpError(400, 'Enter a valid email address')

  const user = findUserByEmail(email)
  if (!user) return res.json({ ok: true })

  // A new link replaces any older one for the same account.
  const token = randomBytes(32).toString('hex')
  db.passwordResets = db.passwordResets.filter((reset) => reset.userId !== user.id)
  db.passwordResets.push({ token, userId: user.id, expiresAt: Date.now() + RESET_LINK_LIFETIME_MS })

  const resetUrl = `${process.env.FRONT_END_URL || 'http://localhost:5173'}/reset-password?token=${token}`
  if (process.env.NODE_ENV !== 'test') console.log(`Password reset link for ${user.email}: ${resetUrl}`)

  res.json(process.env.NODE_ENV === 'production' ? { ok: true } : { ok: true, resetUrl })
})

/**
 * POST /api/auth/reset-password  (#61, front-end: resetPassword)
 * Body: { token, newPassword }  (token comes from the reset link)
 * 200 -> { ok: true }. 400 the reset link is invalid or expired, or the password is too short.
 */
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body ?? {}
  const reset = db.passwordResets.find((item) => item.token === token && item.expiresAt > Date.now())
  const user = reset && db.users.find((item) => item.id === reset.userId)
  if (!user) {
    throw httpError(400, 'This reset link is invalid or has expired. Request a new one from the Forgot Password page.')
  }
  if (!isValidPassword(newPassword)) throw httpError(400, `Use at least ${MIN_PASSWORD_LENGTH} characters for your password`)

  user.passwordHash = await hashPassword(newPassword)
  db.passwordResets = db.passwordResets.filter((item) => item !== reset) // each link works only once
  res.json({ ok: true })
})

export default router
