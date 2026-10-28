import { Page, PagePlaceholder } from '../../components'

/**
 * Log In screen.
 * Owner: Kumneger · Issues: #11
 * Wireframe: ux-design/prototype/log-in.png
 *
 * Use auth.logIn() from useAuth(), then navigate('/home').
 */
export default function LogIn() {
  return (
    <Page title="Log In" back>
      <PagePlaceholder owner="Kumneger" issues={[11]} wireframe="log-in.png" />
    </Page>
  )
}
