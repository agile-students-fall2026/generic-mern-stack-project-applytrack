/*
 * Builds the files for Export Data (#78): a CSV file and a PDF report of the user's applications.
 * Owner: Bertin
 */
import { JOB_TYPE_LABELS, STATUS_LABELS } from './labels.js'

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