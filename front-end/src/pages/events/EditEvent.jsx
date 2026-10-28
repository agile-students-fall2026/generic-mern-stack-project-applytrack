import { Page, PagePlaceholder } from '../../components'

/**
 * Edit Event screen.
 * Owner: Ryan · Issues: #74, #75
 * Wireframe: ux-design/prototype/edit-event.png · Pop-ups: event-saved.png, delete-event.png
 *
 * Get the id with useParams(). Save with api.updateEvent(), delete with api.deleteEvent().
 */
export default function EditEvent() {
  return (
    <Page title="Edit Event" back>
      <PagePlaceholder owner="Ryan" issues={[74, 75]} wireframe="edit-event.png" />
    </Page>
  )
}
