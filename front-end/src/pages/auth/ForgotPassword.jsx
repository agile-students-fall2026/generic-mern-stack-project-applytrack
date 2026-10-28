import { Page, PagePlaceholder } from '../../components'

/**
 * Forgot Password screen.
 * Owner: Kumneger · Issues: #58
 * Wireframe: ux-design/prototype/forgot-password.png · Pop-ups: reset-link-sent.png
 *
 * Call api.requestPasswordReset({ email }), then show a SuccessDialog.
 */
export default function ForgotPassword() {
  return (
    <Page title="Forgot Password" back>
      <PagePlaceholder owner="Kumneger" issues={[58]} wireframe="forgot-password.png" />
    </Page>
  )
}
