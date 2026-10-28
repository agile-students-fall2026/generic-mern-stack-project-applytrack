/*
 * Form validation helpers. Each returns an error message, or '' when the value is fine,
 * so they plug straight into a field's `error` prop.
 */

export const MIN_PASSWORD_LENGTH = 8

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateRequired(value, label = 'This field') {
  return value && String(value).trim() ? '' : `${label} is required`
}

export function validateEmail(value) {
  if (!value || !value.trim()) return 'Email is required'
  return EMAIL_PATTERN.test(value.trim()) ? '' : 'Enter a valid email address'
}

export function validatePassword(value) {
  if (!value) return 'Password is required'
  return value.length >= MIN_PASSWORD_LENGTH ? '' : `Use at least ${MIN_PASSWORD_LENGTH} characters`
}

export function validatePasswordMatch(password, confirmation) {
  if (!confirmation) return 'Re-enter your password'
  return password === confirmation ? '' : "Passwords don't match"
}

/** True when an errors object (e.g. { email: '', password: 'Too short' }) has no messages. */
export function hasNoErrors(errors) {
  return Object.values(errors).every((message) => !message)
}
