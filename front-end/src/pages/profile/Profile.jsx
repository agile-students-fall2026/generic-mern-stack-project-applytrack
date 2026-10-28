import { useState } from 'react'
import { api } from '../../api'
import {
  Avatar,
  Button,
  Card,
  ConfirmDialog,
  ErrorState,
  ListRow,
  LoadingState,
  Page,
  ThemeToggle,
} from '../../components'
import { useApi } from '../../hooks/useApi'
import { useAuth } from '../../hooks/useAuth'
import './Profile.css'

/**
 * Profile screen: account summary, links to account settings, theme choice and log out.
 * Issues: #36, #102, #11 · Wireframe: ux-design/prototype/profile.png · Pop-up: log-out.png
 */
export default function Profile() {
  const { logOut } = useAuth()
  const { data: user, loading, error, reload } = useApi(() => api.getCurrentUser(), [])
  const [confirmLogOut, setConfirmLogOut] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  // After logging out, the app's route guard takes the user to the Welcome screen.
  async function handleLogOut() {
    setLoggingOut(true)
    await logOut()
  }

  return (
    <Page title="Profile">
      {loading && !user && <LoadingState />}
      {error && <ErrorState message={error.message} onRetry={reload} />}

      {user && (
        <>
          <Card className="profile__summary">
            <Avatar src={user.avatarUrl} alt={user.fullName} shape="circle" size={88} />
            <h2>{user.fullName}</h2>
            <p className="text-muted text-small">{user.email}</p>
          </Card>

          <section className="profile__section">
            <h2 className="section-label">Account</h2>
            <Card padding="none">
              <ListRow icon="pencil" title="Edit account" to="/profile/edit" />
              <ListRow icon="bell" title="Notification settings" to="/profile/notifications" />
              <ListRow icon="download" title="Export data" to="/profile/export" />
            </Card>
          </section>

          <section className="profile__section">
            <h2 className="section-label">Appearance</h2>
            <Card>
              <ThemeToggle variant="segmented" />
            </Card>
          </section>

          <Button variant="secondary" fullWidth icon="log-out" onClick={() => setConfirmLogOut(true)}>
            Log out
          </Button>
        </>
      )}

      <ConfirmDialog
        open={confirmLogOut}
        title="Log out?"
        message="You'll need to log in again to see your applications."
        confirmLabel="Log out"
        loading={loggingOut}
        onConfirm={handleLogOut}
        onCancel={() => setConfirmLogOut(false)}
      />
    </Page>
  )
}
