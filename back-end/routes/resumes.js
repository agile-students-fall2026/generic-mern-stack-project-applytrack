/*
 * /api/resumes: upload the resume used for an application (#54).
 * Owner: Bertin
 *
 * The file is saved in public/uploads/resumes/, so the static route serves it at
 * /static/uploads/resumes/<saved name>. The saved name is random, so it can't be guessed.
 */
import { Router } from 'express'
import multer from 'multer'
import { fileURLToPath } from 'node:url'
import { newId, todayString } from '../data/store.js'
import { httpError } from '../middleware/errors.js'

const router = Router()

// Where uploaded resumes are saved (the folder is created automatically)
const RESUMES_FOLDER = fileURLToPath(new URL('../public/uploads/resumes', import.meta.url))

// multer reads the uploaded file from the request and saves it to disk
const upload = multer({
  storage: multer.diskStorage({
    destination: RESUMES_FOLDER,
    // Save it under a new random name, e.g. resume-1a2b3c4d.pdf, so two "resume.pdf" files don't clash
    filename: (req, file, done) => done(null, `${newId('resume')}.pdf`),
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
})

/**
 * POST /api/resumes  (#54, front-end: uploadResume)
 * Send the file as form data in a field named "resume".
 * 201 -> { fileName, url, uploadedAt }  (fileName is the name it had on the user's computer)
 * 400 no file, not a PDF, or bigger than 5 MB.
 */
router.post('/', upload.single('resume'), (req, res) => {
  if (!req.file) throw httpError(400, 'Choose a PDF file')

  res.status(201).json({
    fileName: req.file.originalname,
    url: `/static/uploads/resumes/${req.file.filename}`,
    uploadedAt: todayString(),
  })
})

export default router