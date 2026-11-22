/*
 * /api/statistics: the numbers on the Stats screen.
 * Owner: Ryan (#77)
 */
import { Router } from 'express'
import { db } from '../data/store.js'

const router = Router()

const FINAL_STATUSES = ['offer', 'rejected']

/**
 * GET /api/statistics  (#77, front-end: getStatistics)
 * Counts active (not archived) applications.
 * 200 -> { totalApplied, active, interviews, offers, rejections, responseRate, countByStatus }
 */
router.get('/', (req, res) => {
  // Archived applications are left out
  const applications = db.applications.filter((application) => !application.archived)

  // How many applications have each status, e.g. { applied: 5, interview: 2 }
  const countByStatus = {}
  for (const application of applications) {
    countByStatus[application.status] = (countByStatus[application.status] ?? 0) + 1
  }

  // An application got a response once it moved past "applied"
  const responded = applications.filter((application) => application.status !== 'applied').length

  res.json({
    totalApplied: applications.length,
    // Still in progress: not an offer and not rejected
    active: applications.filter((application) => !FINAL_STATUSES.includes(application.status)).length,
    // An offer means there was an interview, so offers count
    interviews: applications.filter((application) => ['interview', 'offer'].includes(application.status)).length,
    offers: countByStatus.offer ?? 0,
    rejections: countByStatus.rejected ?? 0,
    // Percent of applications that got a response, as a whole number
    responseRate: applications.length ? Math.round((responded / applications.length) * 100) : 0,
    countByStatus,
  })
})

export default router
