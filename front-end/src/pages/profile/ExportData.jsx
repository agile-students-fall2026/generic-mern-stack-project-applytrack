import { Page, PagePlaceholder } from '../../components'

/**
 * Export Data screen.
 * Owner: Kumneger · Issues: #78
 * Wireframe: ux-design/prototype/export-data.png · Pop-ups: export-complete.png
 *
 * Use EXPORT_FORMATS; build the file with api.exportApplications({ format, includeArchived }).
 */
export default function ExportData() {
  return (
    <Page title="Export Data" back>
      <PagePlaceholder owner="Kumneger" issues={[78]} wireframe="export-data.png" />
    </Page>
  )
}
