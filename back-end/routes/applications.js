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

// The fields the Edit Application form can change
const EDITABLE_FIELDS = [
  'company',
  'position',
  'location',
  'jobType',
  'status',
  'dateApplied',
  'jobPostingUrl',
  'recruiters',
  'resume',
  'notes',
]

/** Makes text easy to compare: no extra spaces and all lower case ("  Stripe  Inc " -> "stripe inc") */
function normalize(text) {
  return text.trim().replace(/\s+/g, ' ').toLowerCase()
}

/**
 * GET /api/applications  (Estifanos #63 and #18, front-end: getApplications, getArchivedApplications)
 * Query: ?status=interview to filter by status; ?archived=true for only archived ones (default: only active)
 * 200 -> array of applications
 */
router.get('/', (req, res) => {
  // ?archived=true returns only archived applications, otherwise only current ones
  const archived = req.query.archived === 'true'
  let applications = db.applications.filter((application) => Boolean(application.archived) === archived)

  // ?status=interview keeps only applications with that status
  if (req.query.status) {
    applications = applications.filter((application) => application.status === req.query.status)
  }

  res.json(applications)
})

/**
 * GET /api/applications/duplicate?company=Stripe&position=Intern  (Bertin #17, front-end: findDuplicateApplication)
 * 200 -> the matching application, or null
 */
router.get('/duplicate', (req, res) => {
  const { company, position } = req.query
  if (isBlank(company)) throw httpError(400, 'Company is required')
  if (isBlank(position)) throw httpError(400, 'Position is required')

  const match = db.applications.find(
    (application) =>
      normalize(application.company) === normalize(company) && normalize(application.position) === normalize(position),
  )
  res.json(match ?? null)
})

/**
 * GET /api/applications/:id  (Estifanos #39 and #67, front-end: getApplication)
 * 200 -> the application. 404 not found.
 */
router.get('/:id', (req, res) => {
  // Find the application with the id from the URL, e.g. /api/applications/app-1
  const application = db.applications.find((item) => item.id === req.params.id)
  if (!application) throw httpError(404, 'Application not found')
  res.json(application)
})

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
router.patch('/:id', (req, res) => {
  const application = db.applications.find((item) => item.id === req.params.id)
  if (!application) throw httpError(404, 'Application not found')
  const changes = req.body ?? {}

  // A new status is also added to the status history, with today's date
  if (changes.status && changes.status !== application.status) {
    application.statusHistory.push({ status: changes.status, date: todayString() })
  }

  // Only copy the fields the Edit form can change. The id, status history, archive, offer and
  // interview rounds can't be changed here (archive, offer and rounds have their own routes).
  for (const field of EDITABLE_FIELDS) {
    if (changes[field] !== undefined) application[field] = changes[field]
  }
  application.company = application.company.trim()
  application.position = application.position.trim()

  res.json(application)
})

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
// Set archived to true or false on one application, then send it back
function setArchived(req, res, archived) {
  const application = db.applications.find((item) => item.id === req.params.id)
  if (!application) throw httpError(404, 'Application not found')
  application.archived = archived
  res.json(application)
}

router.post('/:id/archive', (req, res) => setArchived(req, res, true))
router.post('/:id/unarchive', (req, res) => setArchived(req, res, false))

/**
 * PUT /api/applications/:id/offer  (Estifanos #16, front-end: saveOffer)
 * Body: any of { baseSalary, signingBonus, startDate, location, respondBy, remindBefore, decision }
 * 200 -> the updated application. 404 not found.
 */
router.put('/:id/offer', notImplemented)

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
