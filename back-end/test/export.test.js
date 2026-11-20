/*
 * Tests for the export route in routes/export.js.
 * Owner: Bertin (#78)
 */
import { expect, use } from 'chai'
import chaiHttp, { request } from 'chai-http'
import app from '../app.js'
import { db, todayString } from '../data/store.js'
import { authHeader } from './helpers.js'

use(chaiHttp)

describe('GET /api/export', () => {
  // The CSV comes back as a file download named with today's date
  it('downloads a CSV file', async () => {
    const res = await request.execute(app).get('/api/export').set(authHeader()).query({ format: 'csv' })
    expect(res).to.have.status(200)
    expect(res).to.have.header('content-type', /text\/csv/)
    const fileName = `applytrack-applications-${todayString()}.csv`
    expect(res).to.have.header('content-disposition', `attachment; filename=${fileName}`)
    expect(res.text).to.contain('"Company","Position"')
  })

  // Without includeArchived, archived applications are left out of the file and the count
  it('leaves out archived applications by default', async () => {
    const current = db.applications.filter((application) => !application.archived).length
    const res = await request.execute(app).get('/api/export').set(authHeader()).query({ format: 'csv' })
    expect(res).to.have.header('x-export-count', String(current))
    expect(res.text.split('\r\n')).to.have.length(current + 1) // + the header row
  })

  // With includeArchived=true, every application is in the file
  it('includes archived applications when asked', async () => {
    const res = await request
      .execute(app)
      .get('/api/export')
      .set(authHeader())
      .query({ format: 'csv', includeArchived: 'true' })
    expect(res).to.have.header('x-export-count', String(db.applications.length))
  })

  // The PDF is a real PDF file (it starts with "%PDF")
  it('downloads a PDF file', async () => {
    const res = await request
      .execute(app)
      .get('/api/export')
      .set(authHeader())
      .query({ format: 'pdf' })
      .buffer(true)
      .parse((response, done) => {
        // collect the file's bytes so the test can look at them
        const chunks = []
        response.on('data', (chunk) => chunks.push(chunk))
        response.on('end', () => done(null, Buffer.concat(chunks)))
      })
    expect(res).to.have.status(200)
    expect(res).to.have.header('content-type', 'application/pdf')
    expect(res.body.subarray(0, 4).toString()).to.equal('%PDF')
  })

  // Any other format is rejected with a clear message
  it('responds 400 for a format other than csv or pdf', async () => {
    const res = await request.execute(app).get('/api/export').set(authHeader()).query({ format: 'doc' })
    expect(res).to.have.status(400)
    expect(res.body.error).to.equal('Format must be csv or pdf')
  })

  // Export is private: without logging in, the request is refused
  it('responds 401 when not logged in', async () => {
    const res = await request.execute(app).get('/api/export').query({ format: 'csv' })
    expect(res).to.have.status(401)
  })
})