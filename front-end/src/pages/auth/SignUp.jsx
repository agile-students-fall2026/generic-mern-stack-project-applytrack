import { Page, PagePlaceholder } from '../../components'

/**
 * Sign Up screen.
 * Owner: Kumneger · Issues: #6
 * Wireframe: ux-design/prototype/sign-up.png · Pop-ups: account-created.png
 *
 * Use auth.signUp() from useAuth(), then show a SuccessDialog.
 */
export default function SignUp() {
  return (
    <Page title="Sign Up" back>
      <PagePlaceholder owner="Kumneger" issues={[6]} wireframe="sign-up.png" />
    </Page>
  )
}
