/*
 * A tiny PDF writer for plain-text reports (used by Export Data).
 * It lays out lines of text on US Letter pages using the built-in Helvetica font,
 * so no PDF library is needed.
 */

const PAGE_WIDTH = 612 // points (8.5in)
const PAGE_HEIGHT = 792 // points (11in)
const MARGIN = 54
const LINE_HEIGHT = 15
const LINES_PER_PAGE = Math.floor((PAGE_HEIGHT - MARGIN * 2) / LINE_HEIGHT)

// The built-in PDF fonts only support basic characters, so replace common symbols and drop the rest.
function toPdfText(text) {
  return String(text ?? '')
    .replace(/[–—]/g, '-')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/·/g, '-')
    .replace(/…/g, '...')
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
}

/**
 * @param lines  array of { text, bold?, size? } (or plain strings)
 * @returns a Blob containing the PDF
 */
export function createTextPdf(lines) {
  const items = lines.map((line) => (typeof line === 'string' ? { text: line } : line))
  const pages = []
  for (let i = 0; i < items.length; i += LINES_PER_PAGE) pages.push(items.slice(i, i + LINES_PER_PAGE))
  if (pages.length === 0) pages.push([])

  // Objects: 1 catalog, 2 page list, 3 regular font, 4 bold font, then a page + content stream per page.
  const objects = []
  const pageIds = pages.map((_, index) => 5 + index * 2)
  objects[1] = '<< /Type /Catalog /Pages 2 0 R >>'
  objects[2] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pages.length} >>`
  objects[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'
  objects[4] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>'

  pages.forEach((pageLines, index) => {
    const pageId = pageIds[index]
    const contentId = pageId + 1
    const commands = pageLines.map((line, lineIndex) => {
      const y = PAGE_HEIGHT - MARGIN - lineIndex * LINE_HEIGHT
      const font = line.bold ? 'F2' : 'F1'
      return `BT /${font} ${line.size ?? 10} Tf ${MARGIN} ${y} Td (${toPdfText(line.text)}) Tj ET`
    })
    const stream = commands.join('\n')
    objects[pageId] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] ` +
      `/Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`
    objects[contentId] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`
  })

  // Write the file, recording where each object starts (the cross-reference table needs byte offsets).
  // Every character is plain ASCII here, so string length equals byte length.
  let output = '%PDF-1.4\n'
  const offsets = []
  for (let id = 1; id < objects.length; id += 1) {
    offsets[id] = output.length
    output += `${id} 0 obj\n${objects[id]}\nendobj\n`
  }
  const xrefStart = output.length
  output += `xref\n0 ${objects.length}\n0000000000 65535 f \n`
  for (let id = 1; id < objects.length; id += 1) output += `${String(offsets[id]).padStart(10, '0')} 00000 n \n`
  output += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`

  return new Blob([output], { type: 'application/pdf' })
}
