import { Fragment } from 'react'
import { Button, Card, Icon, Logo, Page, StatusBadge, ThemeToggle } from '../../components'
import './Welcome.css'

// The stages shown in the little pipeline illustration
const PIPELINE = ['applied', 'interview', 'offer']

/**
 * Welcome screen: the first screen for logged-out users.
 * Issues: #6, #11 · Wireframe: ux-design/prototype/welcome.png
 */
export default function Welcome() {
  return (
    <Page hideHeader className="welcome">
      <div className="welcome__top">
        <ThemeToggle />
      </div>

      <div className="welcome__hero">
        <Logo height={72} />
        <h1>ApplyTrack</h1>
        <p className="welcome__tagline">Track every internship and job application in one place.</p>
      </div>

      <Card className="welcome__pipeline" aria-hidden="true">
        <div className="welcome__stages">
          {PIPELINE.map((status, index) => (
            <Fragment key={status}>
              {index > 0 && <Icon name="chevron-right" size={16} className="welcome__arrow" />}
              <StatusBadge status={status} />
            </Fragment>
          ))}
        </div>
        <p className="welcome__pipeline-text">
          Follow each application from applied to offer, and never miss a deadline or interview.
        </p>
      </Card>

      <div className="welcome__actions">
        <Button fullWidth to="/signup">
          Create account
        </Button>
        <Button fullWidth variant="secondary" to="/login">
          Log in
        </Button>
      </div>
    </Page>
  )
}
