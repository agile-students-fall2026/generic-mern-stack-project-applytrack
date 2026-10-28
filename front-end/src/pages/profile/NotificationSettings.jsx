import { Page, PagePlaceholder } from '../../components'

/**
 * Notification Settings screen.
 * Owner: Unassigned · Issues: #75
 * Wireframe: ux-design/prototype/notification-settings.png · Pop-ups: settings-saved.png
 *
 * Use Switch rows; load and save with api.getNotificationSettings() / api.updateNotificationSettings().
 */
export default function NotificationSettings() {
  return (
    <Page title="Notification Settings" back>
      <PagePlaceholder owner="Unassigned" issues={[75]} wireframe="notification-settings.png" />
    </Page>
  )
}
