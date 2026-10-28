import { Page, PagePlaceholder, ThemeToggle } from '../../components'

/**
 * Profile screen.
 * Owner: Kumneger · Issues: #36, #102, #11
 * Wireframe: ux-design/prototype/profile.png · Pop-ups: log-out.png
 *
 * Photo, name, email; rows to Edit account, Notification settings, Export data; Log out (ConfirmDialog).
 */
export default function Profile() {
  return (
    <Page title="Profile" action={<ThemeToggle />}>
      <PagePlaceholder owner="Kumneger" issues={[36, 102, 11]} wireframe="profile.png" />
    </Page>
  )
}
