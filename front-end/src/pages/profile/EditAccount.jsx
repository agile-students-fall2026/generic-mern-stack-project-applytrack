import { Page, PagePlaceholder } from '../../components'

/**
 * Edit Account screen.
 * Owner: Kumneger · Issues: #36
 * Wireframe: ux-design/prototype/edit-account.png · Pop-ups: changes-saved.png, delete-account.png
 *
 * Load with api.getCurrentUser(), save with api.updateCurrentUser(changes).
 */
export default function EditAccount() {
  return (
    <Page title="Edit Account" back>
      <PagePlaceholder owner="Kumneger" issues={[36]} wireframe="edit-account.png" />
    </Page>
  )
}
