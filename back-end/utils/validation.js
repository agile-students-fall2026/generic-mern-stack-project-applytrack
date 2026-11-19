/*
 * Input checks shared by the routes. The front-end checks the same things, but the server must
 * check again: anyone can send a request straight to the server and skip the browser.
 */

export const MIN_PASSWORD_LENGTH = 8

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** True when a text field is missing, not text, or only spaces. */
export function isBlank(value) {
  return typeof value !== 'string' || value.trim() === ''
}

export function isValidEmail(value) {
  return !isBlank(value) && EMAIL_PATTERN.test(value.trim())
}

export function isValidPassword(value) {
  return typeof value === 'string' && value.length >= MIN_PASSWORD_LENGTH
}
