/*
 * The real back-end: each function here calls our Express server.
 *
 * Every function has the same name, arguments and return value as the one in mockApi.js, so pages
 * don't change. When your back-end route works, add its function here and the app starts using it
 * instead of the mock version (see index.js). For example:
 *
 *   getStatistics: () => request('GET', '/statistics'),
 *   getApplication: (id) => request('GET', `/applications/${id}`),
 *   createApplication: (fields) => request('POST', '/applications', fields),
 *
 * In development, Vite forwards /api requests to the back-end (see vite.config.js).
 */

/* ===================== Login token ===================== */

// Logging in or signing up gives us a token from the server. We keep it on this device and send it
// with every request, so the server knows who is asking (see back-end/middleware/requireAuth.js).
const TOKEN_KEY = 'applytrack-token'

function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

function saveToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // storage can be unavailable (e.g. private browsing); you stay logged in until the page closes
  }
}

/**
 * Send a request to the back-end and return the JSON it responds with.
 * If the server responds with an error, this throws an Error with the server's message,
 * so pages can show it the same way they show mock errors.
 */
async function request(method, path, body) {
  const options = { method, headers: {} }
  const token = getToken()
  if (token) options.headers.Authorization = `Bearer ${token}`
  if (body !== undefined) {
    options.headers['Content-Type'] = 'application/json'
    options.body = JSON.stringify(body)
  }

  const unreachable = new Error("Couldn't reach the server. Check that the back-end is running.")
  let response
  try {
    response = await fetch(`/api${path}`, options)
  } catch {
    throw unreachable
  }

  const data = await response.json().catch(() => null)
  if (!response.ok) {
    // Our token was refused (expired, or the account is gone): forget it so the next visit asks to log in.
    if (response.status === 401 && token) saveToken(null)
    if (data?.error) throw new Error(data.error)
    // Our server always explains its errors, so an empty 5xx means it couldn't be reached (e.g. it isn't running).
    if (response.status >= 500) throw unreachable
    throw new Error(`Request failed (${response.status})`)
  }
  return data
}

/* ===================== Auth and account (Kumneger: #6, #11, #36, #58) ===================== */

/** True if someone is logged in on this device (synchronous, used when the app starts). */
function hasSession() {
  return Boolean(getToken())
}

async function logIn({ email, password } = {}) {
  const { user, token } = await request('POST', '/auth/login', { email, password })
  saveToken(token)
  return user
}

async function signUp({ fullName, email, password } = {}) {
  const { user, token } = await request('POST', '/auth/signup', { fullName, email, password })
  saveToken(token)
  return user
}

async function logOut() {
  try {
    await request('POST', '/auth/logout')
  } finally {
    saveToken(null) // log out on this device even if the server couldn't be reached
  }
  return { ok: true }
}

async function deleteAccount() {
  await request('DELETE', '/users/me')
  saveToken(null)
  return { ok: true }
}

/* ===================== Export (Bertin: #78) ===================== */

/**
 * Downloads the export file from the server.
 * Returns { fileName, mimeType, content, count }, the same as the mock version, so Export Data doesn't change.
 * It can't use request() above, because the server answers with a file, not JSON.
 */
async function exportApplications({ format = 'csv', includeArchived = false } = {}) {
  const query = new URLSearchParams({ format, includeArchived })
  let response
  try {
    response = await fetch(`/api/export?${query}`, { headers: { Authorization: `Bearer ${getToken()}` } })
  } catch {
    throw new Error("Couldn't reach the server. Check that the back-end is running.")
  }

  if (!response.ok) {
    if (response.status === 401) saveToken(null) // same as request(): a refused token is forgotten
    const data = await response.json().catch(() => null)
    throw new Error(data?.error ?? `Export failed (${response.status})`)
  }

  // The server names the file in a header like: attachment; filename=applytrack-applications-2026-11-20.csv
  const disposition = response.headers.get('Content-Disposition') ?? ''
  const fileName = disposition.split('filename=')[1]?.replaceAll('"', '') || `applytrack-applications.${format}`
  return {
    fileName,
    mimeType: response.headers.get('Content-Type'),
    content: await response.blob(),
    count: Number(response.headers.get('X-Export-Count')),
  }
}

/* ===================== Applications: list, details, archive, offer (Estifanos: #63, #39, #67, #18, #16) ===================== */

/** Current applications; with includeArchived, the archived ones too (same as the mock version). */
async function getApplications({ includeArchived = false } = {}) {
  const current = await request('GET', '/applications')
  if (!includeArchived) return current
  const archived = await request('GET', '/applications?archived=true')
  return [...current, ...archived]
}

/* ===================== Resume upload (Bertin: #54) ===================== */

/**
 * Uploads the chosen resume PDF to the server.
 * Returns { fileName, url, uploadedAt }, which the form saves as the application's resume.
 * It can't use request() above, because it sends a file (form data), not JSON.
 */
async function uploadResume(file) {
  const formData = new FormData()
  formData.append('resume', file) // the server reads the field named "resume"
  let response
  try {
    response = await fetch('/api/resumes', {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` }, // no Content-Type: the browser sets it for form data
      body: formData,
    })
  } catch {
    throw new Error("Couldn't reach the server. Check that the back-end is running.")
  }

  const data = await response.json().catch(() => null)
  if (!response.ok) {
    if (response.status === 401) saveToken(null) // same as request(): a refused token is forgotten
    throw new Error(data?.error ?? `Upload failed (${response.status})`)
  }
  return data
}

export const httpApi = {
  // is the server running? (a working example; no page uses it)
  checkHealth: () => request('GET', '/health'),

  // auth
  hasSession,
  logIn,
  signUp,
  logOut,
  // returns { ok, resetUrl }; resetUrl is only there in development (no email is sent yet)
  requestPasswordReset: ({ email } = {}) => request('POST', '/auth/forgot-password', { email }),
  resetPassword: ({ token, newPassword } = {}) => request('POST', '/auth/reset-password', { token, newPassword }),

  // account
  getCurrentUser: () => request('GET', '/users/me'),
  updateCurrentUser: (changes) => request('PATCH', '/users/me', changes),
  changePassword: ({ currentPassword, newPassword }) =>
    request('PATCH', '/users/me/password', { currentPassword, newPassword }),
  deleteAccount,
  // export
  exportApplications,

  // applications: list, details, archive, offer
  getApplications,
  getArchivedApplications: () => request('GET', '/applications?archived=true'),
  getApplication: (id) => request('GET', `/applications/${id}`),
  archiveApplication: (id) => request('POST', `/applications/${id}/archive`),
  unarchiveApplication: (id) => request('POST', `/applications/${id}/unarchive`),
  saveOffer: (id, offer) => request('PUT', `/applications/${id}/offer`, offer),

  // applications: add, edit, delete, duplicate check (Bertin: #1, #43, #46, #17)
  createApplication: (fields) => request('POST', '/applications', fields),
  findDuplicateApplication: ({ company, position }) =>
    request('GET', `/applications/duplicate?${new URLSearchParams({ company, position })}`),
  updateApplication: (id, changes) => request('PATCH', `/applications/${id}`, changes),
  deleteApplication: (id) => request('DELETE', `/applications/${id}`),

  // resume upload
  uploadResume,

  // notification settings (#75)
  getNotificationSettings: () => request('GET', '/users/me/notification-settings'),
  updateNotificationSettings: (changes) => request('PATCH', '/users/me/notification-settings', changes),


  
  /* ===================== Statistics (Ryan: #77) ===================== */
  getStatistics: () => request('GET', '/statistics'),
}