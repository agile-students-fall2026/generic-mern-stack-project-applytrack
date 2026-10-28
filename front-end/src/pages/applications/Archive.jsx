import { Page, PagePlaceholder } from '../../components'

/**
 * Archived screen.
 * Owner: Estifanos · Issues: #18
 * Wireframe: ux-design/prototype/archive.png · Pop-ups: unarchive-application.png
 *
 * Load with api.getArchivedApplications(); use ApplicationCard with a trailing Unarchive button.
 */
export default function Archive() {
  return (
    <Page title="Archived" back>
      <PagePlaceholder owner="Estifanos" issues={[18]} wireframe="archive.png" />
    </Page>
  )
}
