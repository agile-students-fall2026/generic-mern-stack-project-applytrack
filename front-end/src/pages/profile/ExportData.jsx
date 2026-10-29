import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api'
import { Button, Card, Icon, Page, RadioGroup, SuccessDialog, Switch } from '../../components'
import { EXPORT_FORMATS, getLabel } from '../../constants'
import { downloadFile } from '../../utils/files'
import './ExportData.css'

/**
 * Export Data screen: download all applications as a CSV or PDF file.
 * Issue: #78 · Wireframe: ux-design/prototype/export-data.png · Pop-up: export-complete.png
 */
export default function ExportData() {
  const navigate = useNavigate()
  const [format, setFormat] = useState('csv')
  const [includeArchived, setIncludeArchived] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null) // { fileName, count } after a successful export

  async function handleExport() {
    setExporting(true)
    setError('')
    try {
      const file = await api.exportApplications({ format, includeArchived })
      downloadFile(file.content, file.fileName, file.mimeType)
      setResult({ fileName: file.fileName, count: file.count })
    } catch (err) {
      setError(err.message)
    } finally {
      setExporting(false)
    }
  }

  const formatLabel = getLabel(EXPORT_FORMATS, format)

  return (
    <Page title="Export Data" back="/profile">
      <Card className="export__intro">
        <span className="export__icon">
          <Icon name="download" size={22} />
        </span>
        <h2>Download your applications</h2>
        <p className="text-muted text-small">Get a copy of everything you've tracked, to keep or share.</p>
      </Card>

      <section className="stack-sm">
        <h2 className="section-label">Format</h2>
        <Card>
          <RadioGroup label="Format" options={EXPORT_FORMATS} value={format} onChange={setFormat} />
        </Card>
      </section>

      <section className="stack-sm">
        <h2 className="section-label">Options</h2>
        <Card>
          <Switch label="Include archived applications" checked={includeArchived} onChange={setIncludeArchived} />
        </Card>
      </section>

      {error && (
        <p className="field__error" role="alert">
          {error}
        </p>
      )}

      <Button fullWidth icon="download" loading={exporting} onClick={handleExport}>
        Export as {formatLabel}
      </Button>

      <SuccessDialog
        open={Boolean(result)}
        title="Export complete!"
        message={result && `${result.fileName} was downloaded with ${result.count} applications.`}
        doneLabel="Go to Dashboard"
        onDone={() => navigate('/applications')}
        secondaryLabel="Close"
        onSecondary={() => setResult(null)}
      />
    </Page>
  )
}
