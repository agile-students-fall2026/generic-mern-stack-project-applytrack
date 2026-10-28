import { Button, Logo, Page, PagePlaceholder } from '../../components'

/**
 * Welcome screen.
 * Owner: Kumneger · Issues: #6, #11
 * Wireframe: ux-design/prototype/welcome.png
 *
 * Entry screen: app name, tagline, Create account and Log in buttons.
 */
export default function Welcome() {
  return (
    <Page hideHeader>
      <Logo height={64} />
      <PagePlaceholder owner="Kumneger" issues={[6, 11]} wireframe="welcome.png">
        <p>Until the login screens are built, use these shortcuts to reach your pages:</p>
        <Button variant="secondary" size="sm" to="/home">
          Go to the app (Home)
        </Button>
        <Button variant="secondary" size="sm" to="/dev/components">
          Component gallery
        </Button>
      </PagePlaceholder>
    </Page>
  )
}
