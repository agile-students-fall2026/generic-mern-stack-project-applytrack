/*
 * Tests for the resume upload route in routes/resumes.js.
 * Owner: Bertin (#54)
 */
import { expect, use } from 'chai'
import chaiHttp, { request } from 'chai-http'
import { existsSync, rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import app from '../app.js'
import { authHeader } from './helpers.js'

use(chaiHttp)

// A tiny file that is enough to stand in for a PDF in these tests
const PDF = Buffer.from('%PDF-1.4 test resume')

/** Where the server saved an uploaded file, from its url (/static/... is the public/ folder) */
function savedPath(url) {
  return fileURLToPath(new URL(`../public${url.replace('/static', '')}`, import.meta.url))
}

describe('POST /api/resumes', () => {
  const uploadedUrls = []

  /** Uploads a file the way the front-end does, and remembers it so it can be deleted afterwards */
  async function upload(file, fileName) {
    const res = await request.execute(app).post('/api/resumes').set(authHeader()).attach('resume', file, fileName)
    if (res.status === 201) uploadedUrls.push(res.body.url)
    return res
  }

  // Delete the files these tests uploaded, so running the tests doesn't leave files behind
  afterEach(() => {
    for (const url of uploadedUrls.splice(0)) rmSync(savedPath(url), { force: true })
  })

  // The basic case: the file is saved and the response describes it
  it('saves the PDF and responds 201 with its name, link and date', async () => {
    const res = await upload(PDF, 'My Resume.pdf')
    expect(res).to.have.status(201)
    expect(res.body.fileName).to.equal('My Resume.pdf')
    expect(res.body.url).to.match(/^\/static\/uploads\/resumes\/resume-.+\.pdf$/)
    expect(res.body.uploadedAt).to.match(/^\d{4}-\d{2}-\d{2}$/)
    expect(existsSync(savedPath(res.body.url))).to.equal(true) // really on disk
  })

  // Two files with the same name get different saved names, so neither replaces the other
  it('gives every upload its own saved name', async () => {
    const first = await upload(PDF, 'resume.pdf')
    const second = await upload(PDF, 'resume.pdf')
    expect(first.body.url).to.not.equal(second.body.url)
  })

  // The static route serves the saved file at its url, so the app can open it
  it('makes the file available at its url', async () => {
    const uploaded = await upload(PDF, 'resume.pdf')
    const res = await request.execute(app).get(uploaded.body.url).buffer(true)
    expect(res).to.have.status(200)
    expect(res).to.have.header('content-type', 'application/pdf')
  })
})

describe('POST /api/resumes errors', () => {
  // Only PDFs are accepted, like the form says
  it('responds 400 for a file that is not a PDF', async () => {
    const res = await request
      .execute(app)
      .post('/api/resumes')
      .set(authHeader())
      .attach('resume', Buffer.from('hello'), 'notes.txt')
    expect(res).to.have.status(400)
    expect(res.body.error).to.equal('Resume must be a PDF file')
  })

  // Sending the form without a file is a clear 400, not a crash
  it('responds 400 when no file is sent', async () => {
    const res = await request.execute(app).post('/api/resumes').set(authHeader()).field('note', 'no file')
    expect(res).to.have.status(400)
    expect(res.body.error).to.equal('Choose a PDF file')
  })

  // Files over 5 MB are refused (and nothing is kept on disk)
  it('responds 400 for a file bigger than 5 MB', async () => {
    const bigFile = Buffer.alloc(6 * 1024 * 1024)
    const res = await request.execute(app).post('/api/resumes').set(authHeader()).attach('resume', bigFile, 'big.pdf')
    expect(res).to.have.status(400)
    expect(res.body.error).to.equal('Resume must be 5 MB or smaller')
  })

  // Uploading is private: without logging in, the request is refused
  it('responds 401 when not logged in', async () => {
    const res = await request.execute(app).post('/api/resumes').attach('resume', PDF, 'resume.pdf')
    expect(res).to.have.status(401)
  })
})