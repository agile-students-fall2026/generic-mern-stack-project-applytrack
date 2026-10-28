import { Page, PagePlaceholder } from '../../components'

/**
 * Reset Password screen.
 * Owner: Kumneger · Issues: #58
 * Wireframe: ux-design/prototype/reset-password.png · Pop-ups: password-updated.png
 *
 * Call api.resetPassword({ newPassword }), then show a SuccessDialog.
 */
export default function ResetPassword() {
  return (
    <Page title="Reset Password" back>
      <PagePlaceholder owner="Kumneger" issues={[58]} wireframe="reset-password.png" />
    </Page>
  )
}
