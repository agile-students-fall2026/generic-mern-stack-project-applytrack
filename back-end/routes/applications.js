/*
 * /api/applications: job and internship applications, offers and interview rounds.
 * Owners: Bertin (#1, #17, #43, #46, #49, #54), Estifanos (#16, #18, #39, #63, #67), Ryan (#15)
 *
 * The data is db.applications in data/store.js; see data/applications.json for every field.
 * Order matters: Express uses the first route that matches, so /duplicate must stay above /:id.
 */
import { Router } from 'express'
import { db, newId, todayString } from '../data/store.js'
import { httpError, notImplemented } from '../middleware/errors.js'
const router = Router()

/** True when a required text field is missing or only spaces */
function isBlank(value) {
  return typeof value !== 'string' || value.trim() === ''
}

/**
 * GET /api/applications  (Estifanos #63 and #18, front-end: getApplications, getArchivedApplications)
 * Query: ?status=interview to filter by status; ?archived=true for only archived ones (default: only active)
 * 200 -> array of applications
 */
router.get('/', notImplemented)

/**
 * GET /api/applications/duplicate?company=Stripe&position=Intern  (Bertin #17, front-end: findDuplicateApplication)
 * Same company and position, ignoring upper/lower case and extra spaces.
 * 200 -> the matching application, or null
 */
router.get('/duplicate', notImplemented)

/**
 * GET /api/applications/:id  (Estifanos #39 and #67, front-end: getApplication)
 * 200 -> the application. 404 not found.
 */
router.get('/:id', notImplemented)

/**
 * POST /api/applications  (owner: Bertin #1, #49 recruiters, #54 resume, front-end: createApplication)
 * Body: { company, position, dateApplied, status, location, jobType, jobPostingUrl, recruiters, resume, notes }
 * Fill in defaults and the new id the same way createApplication in the front-end mockApi.js does.
 * 201 -> the new application. 400 company or position missing.
 */
router.post('/', (req, res) => {
  const fields = req.body ?? {}
  // Company and position are required; every other field is optional
  if (isBlank(fields.company)) throw httpError(400, 'Company is required')
  if (isBlank(fields.position)) throw httpError(400, 'Position is required')
  const company = fields.company.trim()
  const position = fields.position.trim()
  const status = fields.status || 'applied'

  // The new application, with a default for every field that was left out
  const application = {
    id: newId('app'),
    company,
    position,
    location: fields.location || '',
    jobType: fields.jobType || 'internship',
    status,
    dateApplied: fields.dateApplied || todayString(),
    jobPostingUrl: fields.jobPostingUrl || '',
    logoUrl: `https://picsum.photos/seed/${encodeURIComponent(company.toLowerCase())}/96/96`,
    recruiters: fields.recruiters || [], // #49 recruiter contacts
    resume: fields.resume || null, // #54 resume used, e.g. { fileName, uploadedAt }
    notes: fields.notes || '',
    archived: false,
    statusHistory: [{ status, date: todayString() }],
    interviewRounds: [],
    offer: null,
  }

  // Newest first, like the dashboard shows them
  db.applications.unshift(application)
  res.status(201).json(application)
})
/**
 * PATCH /api/applications/:id  (Bertin #43, front-end: updateApplication)
 * Body: any fields to change. A new status also adds { status, date } to statusHistory.
 * 200 -> the updated application. 404 not found.
 */
router.patch('/:id', notImplemented)

/**
 * DELETE /api/applications/:id  (Bertin #46, front-end: deleteApplication)
 * Also deletes the application's events.
 * 200 -> { ok: true }. 404 not found.
 */
router.delete('/:id', notImplemented)

/**
 * POST /api/applications/:id/archive and /unarchive  (Estifanos #18, front-end: archiveApplication, unarchiveApplication)
 * 200 -> the updated application. 404 not found.
 */
router.post('/:id/archive', notImplemented)
router.post('/:id/unarchive', notImplemented)

/**
 * PUT /api/applications/:id/offer  (Estifanos #16, front-end: saveOffer)
 * Body: any of { baseSalary, signingBonus, startDate, location, respondBy, remindBefore, decision }
 * 200 -> the updated application. 404 not found.
 */
router.put('/:id/offer', (req, res) => {
  const application = db.applications.find((item) => item.id === req.params.id)
  if (!application) throw httpError(404, 'Application not found')

  // Keep only the offer fields we expect, so nothing else gets saved by accident
  const OFFER_FIELDS = ['baseSalary', 'signingBonus', 'startDate', 'location', 'respondBy', 'remindBefore', 'decision', 'notes']
  const changes = {}
  for (const field of OFFER_FIELDS) {
    if (field in (req.body ?? {})) changes[field] = req.body[field]
  }

  // Merge into the existing offer (or start a new one), like saveOffer in the front-end mockApi.js
  application.offer = { ...application.offer, ...changes }
  res.json(application)
})

/**
 * POST /api/applications/:id/rounds  (Ryan #15, front-end: addInterviewRound)
 * Body: { name, type, date, interviewer, notes }
 * 201 -> the new round (with its new id)
 */
router.post('/:id/rounds', notImplemented)

/**
 * PATCH /api/applications/:id/rounds/:roundId  (Ryan #15, front-end: updateInterviewRound)
 * 200 -> the updated round. 404 application or round not found.
 */
router.patch('/:id/rounds/:roundId', notImplemented)

/**
 * DELETE /api/applications/:id/rounds/:roundId  (Ryan #15, front-end: deleteInterviewRound)
 * Also deletes the round's interview event, like the front-end mockApi.js does.
 * 200 -> { ok: true }. 404 application or round not found.
 */
router.delete('/:id/rounds/:roundId', notImplemented)

export default router
