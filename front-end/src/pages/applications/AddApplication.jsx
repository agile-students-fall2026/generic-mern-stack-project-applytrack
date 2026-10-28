import { Page, PagePlaceholder } from '../../components'

/**
 * Add Application screen.
 * Owner: Bertin · Issues: #1, #17, #49, #54
 * Wireframe: ux-design/prototype/add-application.png · Pop-ups: application-saved.png
 *
 * Call api.findDuplicateApplication() before api.createApplication() to show the duplicate warning (#17).
 */
export default function AddApplication() {
  return (
    <Page title="Add Application" back>
      <PagePlaceholder owner="Bertin" issues={[1, 17, 49, 54]} wireframe="add-application.png" />
    </Page>
  )
}
