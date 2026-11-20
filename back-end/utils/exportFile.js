/*
 * Builds the files for Export Data (#78): a CSV file and a PDF report of the user's applications.
 * Owner: Bertin
 */
import { JOB_TYPE_LABELS, STATUS_LABELS } from './labels.js'
import { createTextPdf } from './pdf.js'

// One column per field, in the order they appear in the CSV file
const EXPORT_COLUMNS = [
  { header: 'Company', value: (item) => item.company },
  { header: 'Position', value: (item) => item.position },
  { header: 'Location', value: (item) => item.location },
  { header: 'Job type', value: (item) => JOB_TYPE_LABELS[item.jobType] },
  { header: 'Status', value: (item) => STATUS_LABELS[item.status] },
  { header: 'Date applied', value: (item) => item.dateApplied },
  { header: 'Archived', value: (item) => (item.archived ? 'Yes' : 'No') },
  { header: 'Job posting', value: (item) => item.jobPostingUrl },
  { header: 'Recruiter', value: (item) => item.recruiters?.[0]?.name },
  { header: 'Recruiter email', value: (item) => item.recruiters?.[0]?.email },
  { header: 'Resume used', value: (item) => item.resume?.fileName },
  { header: 'Notes', value: (item) => item.notes },
]

/**
 * Puts a value in quotes for CSV, so commas and line breaks inside it don't split the cell.
 * A quote inside the value is written twice ("" means one ").
 */
function csvCell(value) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`
}

/** Builds the CSV text: a header row, then one row per application */
export function buildCsv(applications) {
  const header = EXPORT_COLUMNS.map((column) => csvCell(column.header)).join(',')
  const rows = applications.map((item) => EXPORT_COLUMNS.map((column) => csvCell(column.value(item))).join(','))
  // \uFEFF at the start tells Excel the file is UTF-8, so accented names display correctly
  return '\uFEFF' + [header, ...rows].join('\r\n')
}


/** "2026-10-18" -> "Oct 18, 2026" (the same format the app uses) */
function formatDate(value) {
  if (!value) return ''
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/**
 * Builds the PDF report: a title, then a short block of lines for each application.
 * @param today  today's date as "YYYY-MM-DD", shown under the title
 */
export function buildPdf(applications, today) {
  const lines = [
    { text: 'ApplyTrack - Applications', bold: true, size: 16 },
    { text: `Exported ${formatDate(today)} - ${applications.length} applications` },
    { text: '' },
  ]
  for (const item of applications) {
    lines.push({ text: `${item.company} - ${item.position}`, bold: true, size: 11 })
    const archived = item.archived ? ' - archived' : ''
    lines.push({ text: `${STATUS_LABELS[item.status]} - applied ${formatDate(item.dateApplied)}${archived}` })
    // Location and job type on one line, leaving out whichever is empty
    const details = [item.location, JOB_TYPE_LABELS[item.jobType]].filter(Boolean).join(' - ')
    if (details) lines.push({ text: details })
    if (item.jobPostingUrl) lines.push({ text: item.jobPostingUrl })
    if (item.notes) lines.push({ text: `Notes: ${item.notes}` })
    lines.push({ text: '' }) // a blank line between applications
  }
  return createTextPdf(lines)
}