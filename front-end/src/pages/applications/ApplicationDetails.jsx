import { useParams } from 'react-router-dom'
import { Button, Page, PagePlaceholder } from '../../components'

/**
 * Application screen.
 * Owner: Estifanos · Issues: #39, #67, #18, #16
 * Wireframe: ux-design/prototype/application-details.png · Pop-ups: update-status.png, archive-application.png, delete-application.png
 *
 * Get the id with useParams(). The delete confirmation (#46) belongs to Bertin; coordinate on this file.
 */
export default function ApplicationDetails() {
  const { id } = useParams()

  return (
    <Page title="Application" back action={<Button variant="ghost" size="sm" to={`/applications/${id}/edit`}>Edit</Button>}>
      <PagePlaceholder owner="Estifanos" issues={[39, 67, 18, 16]} wireframe="application-details.png" />
    </Page>
  )
}
