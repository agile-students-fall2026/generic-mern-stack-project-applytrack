/*
 * Mock back-end for Sprint 1.
 *
 * Data is fetched from the JSON files in public/mock-data/ and then kept in memory, so
 * creating, editing and deleting work while the app is open. Reloading the page resets it.
 *
 * Every function is async and returns copies of the data, exactly like a real API would.
 * In Sprint 2 the bodies of these functions will be replaced with calls to our Express
 * back-end; pages that use `api.*` won't need to change.
 */

import { FINAL_STATUSES } from '../constants'
import { todayString } from '../utils/format'

const FAKE_DELAY_MS = 250 // simulate network time so loading states are visible

const wait = (ms = FAKE_DELAY_MS) => new Promise((resolve) => setTimeout(resolve, ms))
const copy = (value) => structuredClone(value)
const newId = (prefix) => `${prefix}-${crypto.randomUUID().slice(0, 8)}`

let store = null

async function fetchJson(file) {
  const response = await fetch(`/mock-data/${file}`)
  if (!response.ok) throw new Error(`Could not load mock data: ${file}`)
  return response.json()
}

// Load all mock data once, the first time any api function is called.
async function getStore() {
  if (!store) {
    const [applications, events, user] = await Promise.all([
      fetchJson('applications.json'),
      fetchJson('events.json'),
      fetchJson('user.json'),
    ])
    store = { applications, events, user }
  }
  await wait()
  return store
}

function findApplication(data, id) {
  const application = data.applications.find((item) => item.id === id)
  if (!application) throw new Error('Application not found')
  return application
}

function findEvent(data, id) {
  const event = data.events.find((item) => item.id === id)
  if (!event) throw new Error('Event not found')
  return event
}

const normalize = (text = '') => text.trim().toLowerCase()

/* ===================== Auth ===================== */
// These accept any input for now. Real validation comes with the back-end.

async function logIn({ email, password } = {}) {
  await wait()
  if (!email || !password) throw new Error('Enter your email and password')
  return { ok: true }
}

async function signUp({ fullName, email, password } = {}) {
  const data = await getStore()
  if (!fullName || !email || !password) throw new Error('Fill in all fields')
  data.user = { ...data.user, fullName, email }
  return copy(data.user)
}

async function logOut() {
  await wait()
  return { ok: true }
}

async function requestPasswordReset({ email } = {}) {
  await wait()
  if (!email) throw new Error('Enter your email')
  return { ok: true }
}

async function resetPassword({ newPassword } = {}) {
  await wait()
  if (!newPassword) throw new Error('Enter a new password')
  return { ok: true }
}

/* ===================== Current user ===================== */

async function getCurrentUser() {
  const data = await getStore()
  return copy(data.user)
}

async function updateCurrentUser(changes) {
  const data = await getStore()
  data.user = { ...data.user, ...changes }
  return copy(data.user)
}

async function deleteAccount() {
  await getStore()
  store = null // forget everything; it reloads fresh from the JSON files next time
  return { ok: true }
}

async function getNotificationSettings() {
  const data = await getStore()
  return copy(data.user.notificationSettings)
}

async function updateNotificationSettings(changes) {
  const data = await getStore()
  data.user.notificationSettings = { ...data.user.notificationSettings, ...changes }
  return copy(data.user.notificationSettings)
}

/* ===================== Applications ===================== */

/** All applications. Archived ones are left out unless { includeArchived: true } is passed. */
async function getApplications({ includeArchived = false } = {}) {
  const data = await getStore()
  return copy(data.applications.filter((item) => includeArchived || !item.archived))
}

async function getArchivedApplications() {
  const data = await getStore()
  return copy(data.applications.filter((item) => item.archived))
}

async function getApplication(id) {
  const data = await getStore()
  return copy(findApplication(data, id))
}

async function createApplication(fields) {
  const data = await getStore()
  const status = fields.status ?? 'applied'
  const application = {
    location: '',
    jobType: 'internship',
    jobPostingUrl: '',
    logoUrl: `https://picsum.photos/seed/${encodeURIComponent(fields.company ?? 'company')}/96/96`,
    recruiters: [],
    resume: null,
    notes: '',
    interviewRounds: [],
    offer: null,
    ...fields,
    id: newId('app'),
    status,
    dateApplied: fields.dateApplied || todayString(),
    archived: false,
    statusHistory: [{ status, date: todayString() }],
  }
  data.applications.unshift(application)
  return copy(application)
}

/** Update any fields. Changing `status` automatically adds an entry to `statusHistory`. */
async function updateApplication(id, changes) {
  const data = await getStore()
  const application = findApplication(data, id)
  if (changes.status && changes.status !== application.status) {
    application.statusHistory.push({ status: changes.status, date: todayString() })
  }
  Object.assign(application, changes, { id })
  return copy(application)
}

async function deleteApplication(id) {
  const data = await getStore()
  findApplication(data, id)
  data.applications = data.applications.filter((item) => item.id !== id)
  data.events = data.events.filter((event) => event.applicationId !== id)
  return { ok: true }
}

async function archiveApplication(id) {
  return updateApplication(id, { archived: true })
}

async function unarchiveApplication(id) {
  return updateApplication(id, { archived: false })
}

/** Returns an existing application with the same company and position (ignoring case and spaces), or null. */
async function findDuplicateApplication({ company, position }) {
  const data = await getStore()
  const match = data.applications.find(
    (item) => normalize(item.company) === normalize(company) && normalize(item.position) === normalize(position),
  )
  return match ? copy(match) : null
}

/* ===================== Offer details ===================== */

async function saveOffer(applicationId, offer) {
  const data = await getStore()
  const application = findApplication(data, applicationId)
  application.offer = { ...application.offer, ...offer }
  return copy(application)
}

/* ===================== Interview rounds ===================== */

async function addInterviewRound(applicationId, round) {
  const data = await getStore()
  const application = findApplication(data, applicationId)
  const saved = { ...round, id: newId('round') }
  application.interviewRounds.push(saved)
  return copy(saved)
}

async function updateInterviewRound(applicationId, roundId, changes) {
  const data = await getStore()
  const application = findApplication(data, applicationId)
  const round = application.interviewRounds.find((item) => item.id === roundId)
  if (!round) throw new Error('Interview round not found')
  Object.assign(round, changes, { id: roundId })
  return copy(round)
}

async function deleteInterviewRound(applicationId, roundId) {
  const data = await getStore()
  const application = findApplication(data, applicationId)
  application.interviewRounds = application.interviewRounds.filter((item) => item.id !== roundId)
  return { ok: true }
}

/* ===================== Events (deadlines, interviews, follow-ups) ===================== */

/** All events, soonest first. Pass { applicationId } to get only one application's events. */
async function getEvents({ applicationId } = {}) {
  const data = await getStore()
  return copy(
    data.events
      .filter((event) => !applicationId || event.applicationId === applicationId)
      .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)),
  )
}

async function getEvent(id) {
  const data = await getStore()
  return copy(findEvent(data, id))
}

async function createEvent(fields) {
  const data = await getStore()
  const event = { notes: '', reminder: { enabled: false, before: '1-day' }, ...fields, id: newId('event') }
  data.events.push(event)
  return copy(event)
}

async function updateEvent(id, changes) {
  const data = await getStore()
  const event = findEvent(data, id)
  Object.assign(event, changes, { id })
  return copy(event)
}

async function deleteEvent(id) {
  const data = await getStore()
  findEvent(data, id)
  data.events = data.events.filter((event) => event.id !== id)
  return { ok: true }
}

/* ===================== Statistics ===================== */

async function getStatistics() {
  const data = await getStore()
  const active = data.applications.filter((item) => !item.archived)
  const countByStatus = {}
  for (const item of active) countByStatus[item.status] = (countByStatus[item.status] ?? 0) + 1

  const responded = active.filter((item) => item.status !== 'applied').length
  return {
    totalApplied: active.length,
    active: active.filter((item) => !FINAL_STATUSES.includes(item.status)).length,
    interviews: active.filter((item) => ['interview', 'offer'].includes(item.status)).length,
    offers: countByStatus.offer ?? 0,
    rejections: countByStatus.rejected ?? 0,
    responseRate: active.length ? Math.round((responded / active.length) * 100) : 0,
    countByStatus,
  }
}

/* ===================== Export ===================== */

/** Builds the export file. Returns { fileName, mimeType, content }; the page decides how to download it. */
async function exportApplications({ format = 'csv', includeArchived = false } = {}) {
  const applications = await getApplications({ includeArchived })
  const columns = ['company', 'position', 'location', 'jobType', 'status', 'dateApplied', 'jobPostingUrl', 'notes']
  const escape = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`
  const rows = applications.map((item) => columns.map((column) => escape(item[column])).join(','))
  const content = [columns.join(','), ...rows].join('\n')
  // PDF export is a placeholder until the back-end can generate real PDFs.
  return { fileName: `applytrack-applications.${format}`, mimeType: 'text/csv', content }
}

export const mockApi = {
  // auth
  logIn,
  signUp,
  logOut,
  requestPasswordReset,
  resetPassword,
  // user
  getCurrentUser,
  updateCurrentUser,
  deleteAccount,
  getNotificationSettings,
  updateNotificationSettings,
  // applications
  getApplications,
  getArchivedApplications,
  getApplication,
  createApplication,
  updateApplication,
  deleteApplication,
  archiveApplication,
  unarchiveApplication,
  findDuplicateApplication,
  saveOffer,
  addInterviewRound,
  updateInterviewRound,
  deleteInterviewRound,
  // events
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  // statistics and export
  getStatistics,
  exportApplications,
}
