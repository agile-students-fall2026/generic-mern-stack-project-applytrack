/*
 * /api/export: download your applications as a file.
 * Owner: Bertin (#78)
 */
import { Router } from 'express'
import { db, todayString } from '../data/store.js'
import { httpError } from '../middleware/errors.js'
import { buildCsv, buildPdf } from '../utils/exportFile.js'

const router = Router()

/**
 * GET /api/export?format=csv&includeArchived=true  (#78, front-end: exportApplications)
 * format is "csv" or "pdf"; archived applications are only included when includeArchived=true.
 * 200 -> the file itself, as a download. The X-Export-Count header says how many applications it has.
 * 400 format isn't csv or pdf.
 */
router.get('/', (req, res) => {
  const format = req.query.format || 'csv'
  if (format !== 'csv' && format !== 'pdf') throw httpError(400, 'Format must be csv or pdf')

  // Archived applications are left out unless they were asked for
  const includeArchived = req.query.includeArchived === 'true'
  const applications = db.applications.filter((application) => includeArchived || !application.archived)

  // res.attachment() tells the browser to download the file with this name
  res.attachment(`applytrack-applications-${todayString()}.${format}`)
  res.set('X-Export-Count', String(applications.length))

  if (format === 'pdf') {
    res.type('application/pdf').send(buildPdf(applications, todayString()))
  } else {
    res.type('text/csv').send(buildCsv(applications))
  }
})

export default router