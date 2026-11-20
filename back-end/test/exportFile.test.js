/*
 * Tests for the CSV and PDF builders in utils/exportFile.js.
 * Owner: Bertin (#78)
 */
import { expect } from 'chai'
import { buildCsv, buildPdf } from '../utils/exportFile.js'

// A small application with every field the export uses
const stripe = {
  company: 'Stripe',
  position: 'Software Engineering Intern',
  location: 'New York, NY',
  jobType: 'internship',
  status: 'online-assessment',
  dateApplied: '2026-10-02',
  archived: false,
  jobPostingUrl: 'https://stripe.com/jobs',
  recruiters: [{ name: 'Sam Lee', email: 'sam@stripe.example', phone: '' }],
  resume: { fileName: 'resume.pdf', uploadedAt: '2026-10-01' },
  notes: 'Referred by a friend',
}

describe('buildCsv', () => {
  // The first row names the columns, so the file makes sense when opened in Excel
  it('starts with a header row', () => {
    const lines = buildCsv([]).split('\r\n')
    expect(lines[0]).to.contain('"Company","Position","Location"')
  })

  // One row per application, after the header
  it('adds one row per application', () => {
    const lines = buildCsv([stripe, stripe]).split('\r\n')
    expect(lines).to.have.length(3)
  })

  // Stored values like "online-assessment" are shown with the names the app uses
  it('writes status and job type names, not the stored values', () => {
    const row = buildCsv([stripe]).split('\r\n')[1]
    expect(row).to.contain('"Online Assessment"')
    expect(row).to.contain('"Internship"')
    expect(row).to.contain('"Sam Lee","sam@stripe.example","resume.pdf"')
  })

  // A comma inside a value ("New York, NY") must not split it into two cells
  it('keeps commas and quotes inside a cell', () => {
    const row = buildCsv([{ ...stripe, notes: 'Said "great fit"' }]).split('\r\n')[1]
    expect(row).to.contain('"New York, NY"')
    expect(row).to.contain('"Said ""great fit"""')
  })

  // Missing optional fields become empty cells instead of the word "undefined"
  it('leaves empty cells for missing fields', () => {
    const acme = { company: 'Acme', position: 'Intern', status: 'applied', jobType: 'internship' }
    const row = buildCsv([acme]).split('\r\n')[1]
    expect(row).to.not.contain('undefined')
    expect(row).to.contain('"Acme","Intern",""')
  })
})

describe('buildPdf', () => {
  // A real PDF file always starts with "%PDF" and ends with "%%EOF"
  it('builds a PDF file', () => {
    const pdf = buildPdf([stripe], '2026-11-20').toString('latin1')
    expect(pdf.startsWith('%PDF-1.4')).to.equal(true)
    expect(pdf.trim().endsWith('%%EOF')).to.equal(true)
  })

  // The report shows the title, the date, and each application's details
  it('lists each application with its status and date', () => {
    const pdf = buildPdf([stripe], '2026-11-20').toString('latin1')
    expect(pdf).to.contain('Exported Nov 20, 2026 - 1 applications')
    expect(pdf).to.contain('Stripe - Software Engineering Intern')
    expect(pdf).to.contain('Online Assessment - applied Oct 2, 2026')
    expect(pdf).to.contain('Notes: Referred by a friend')
  })
})