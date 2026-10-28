import { Page, PagePlaceholder } from '../../components'

/**
 * Edit Application screen.
 * Owner: Bertin · Issues: #43, #49, #54
 * Wireframe: ux-design/prototype/edit-application.png · Pop-ups: changes-saved.png
 *
 * Get the id with useParams(), load with api.getApplication(id), save with api.updateApplication(id, changes).
 */
export default function EditApplication() {
  return (
    <Page title="Edit Application" back>
      <PagePlaceholder owner="Bertin" issues={[43, 49, 54]} wireframe="edit-application.png" />
    </Page>
  )
}
