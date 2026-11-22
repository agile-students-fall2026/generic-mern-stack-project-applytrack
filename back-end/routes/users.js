/*
 * /api/users/me: the logged-in user's account and settings. req.user is the logged-in user.
 * Owners: Kumneger (#36) for the account, Ryan (#75) for notification settings
 */
import { Router } from 'express'
import { db } from '../data/store.js'
import { httpError, notImplemented } from '../middleware/errors.js'
import { findUserByEmail, hashPassword, passwordMatches, toPublicUser } from '../utils/auth.js'
import { isBlank, isValidEmail, isValidPassword, MIN_PASSWORD_LENGTH } from '../utils/validation.js'

const router = Router()

/**
 * GET /api/users/me  (#36, front-end: getCurrentUser)
 * 200 -> the user (never include the password)
 */
router.get('/me', (req, res) => {
  res.json(toPublicUser(req.user))
})

/**
 * PATCH /api/users/me  (#37, front-end: updateCurrentUser)
 * Body: any of { fullName, email, avatarUrl }
 * 200 -> the updated user. 400 invalid input, 409 email already used by another account.
 */
router.patch('/me', (req, res) => {
  const { fullName, email, avatarUrl } = req.body ?? {}

  // Check every field that was sent before changing anything, so a bad field doesn't leave half an update.
  if (fullName !== undefined && isBlank(fullName)) throw httpError(400, 'Full name is required')
  if (email !== undefined) {
    if (!isValidEmail(email)) throw httpError(400, 'Enter a valid email address')
    const owner = findUserByEmail(email)
    if (owner && owner !== req.user) throw httpError(409, 'Another account already uses this email')
  }
  if (avatarUrl !== undefined && typeof avatarUrl !== 'string') throw httpError(400, 'Choose a valid photo')

  if (fullName !== undefined) req.user.fullName = fullName.trim()
  if (email !== undefined) req.user.email = email.trim()
  if (avatarUrl !== undefined) req.user.avatarUrl = avatarUrl
  res.json(toPublicUser(req.user))
})

/**
 * PATCH /api/users/me/password  (#37, front-end: changePassword)
 * Body: { currentPassword, newPassword }
 * 200 -> { ok: true }. 400 current password is wrong or the new one is too short.
 */
router.patch('/me/password', async (req, res) => {
  const { currentPassword, newPassword } = req.body ?? {}
  if (typeof currentPassword !== 'string' || !(await passwordMatches(currentPassword, req.user.passwordHash))) {
    throw httpError(400, 'Current password is incorrect')
  }
  if (!isValidPassword(newPassword)) throw httpError(400, `Use at least ${MIN_PASSWORD_LENGTH} characters for your new password`)

  req.user.passwordHash = await hashPassword(newPassword)
  res.json({ ok: true })
})

/**
 * DELETE /api/users/me  (#38, front-end: deleteAccount)
 * Removes the account and logs the user out: with the user gone, their token stops working.
 * (Applications and events aren't linked to a user until the database in Sprint 3, so they stay.)
 * 200 -> { ok: true }
 */
router.delete('/me', (req, res) => {
  db.users = db.users.filter((user) => user !== req.user)
  res.json({ ok: true })
})

/**
 * GET /api/users/me/notification-settings  (#75, front-end: getNotificationSettings)
 * 200 -> { deadlineReminders, interviewReminders, followUpReminders, defaultReminder }
 */
router.get('/me/notification-settings', (req, res) => {
  res.json(req.user.notificationSettings ?? {})
})

/**
 * PATCH /api/users/me/notification-settings  (#75, front-end: updateNotificationSettings)
 * Body: any of the settings above
 * 200 -> all the settings after the change
 */
// The on/off switches on the Notification Settings page
const REMINDER_SWITCHES = ['deadlineReminders', 'interviewReminders', 'followUpReminders']

router.patch('/me/notification-settings', (req, res) => {
  const changes = req.body ?? {}

  // Check every field that was sent before changing anything, like PATCH /me does
  for (const field of REMINDER_SWITCHES) {
    if (changes[field] !== undefined && typeof changes[field] !== 'boolean') {
      throw httpError(400, `${field} must be true or false`)
    }
  }
  if (changes.defaultReminder !== undefined && isBlank(changes.defaultReminder)) {
    throw httpError(400, 'Choose when to be reminded')
  }

  // Only the fields that were sent change; the rest are kept
  if (!req.user.notificationSettings) req.user.notificationSettings = {}
  const settings = req.user.notificationSettings
  for (const field of REMINDER_SWITCHES) {
    if (changes[field] !== undefined) settings[field] = changes[field]
  }
  if (changes.defaultReminder !== undefined) settings.defaultReminder = changes.defaultReminder

  res.json(settings)
})

export default router
