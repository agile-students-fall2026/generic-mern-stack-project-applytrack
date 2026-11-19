/*
 * In-memory mock data for Sprint 2 (no database yet; MongoDB comes in Sprint 3).
 *
 * The JSON files in this folder are the starting data. They're copied into `db` when the server
 * starts, and routes read and change `db` directly. Changes last until the server restarts.
 *
 * Usage in a route:
 *   import { db, newId } from '../data/store.js'
 *   const application = db.applications.find((item) => item.id === req.params.id)
 */
import { readFileSync } from 'node:fs'

function readJson(fileName) {
  return JSON.parse(readFileSync(new URL(`./${fileName}`, import.meta.url), 'utf8'))
}

export const db = {
  users: [],
  applications: [],
  events: [],
  passwordResets: [], // { token, userId, expiresAt } for open "forgot password" links
  loggedOutTokens: [], // login tokens that were logged out and can't be used again
}

/** Put the starting data back. Runs once on startup; tests call it before each test for a clean slate. */
export function resetStore() {
  db.users = readJson('users.json')
  db.applications = readJson('applications.json')
  db.events = readJson('events.json')
  db.passwordResets = []
  db.loggedOutTokens = []
}

/** A new unique id with a readable prefix, e.g. newId('app') -> "app-3f9c2a1b". */
export function newId(prefix) {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`
}

/** Today's local date as "YYYY-MM-DD", the format every date in the data uses. */
export function todayString() {
  const now = new Date()
  const pad = (number) => String(number).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

resetStore()
