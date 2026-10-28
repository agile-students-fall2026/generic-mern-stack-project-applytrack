import { Page, PagePlaceholder } from '../../components'

/**
 * Add Follow-up Event screen.
 * Owner: Ryan · Issues: #74, #75
 * Wireframe: ux-design/prototype/add-follow-up-event.png · Pop-ups: event-saved.png
 *
 * Use EVENT_TYPES and REMINDER_OPTIONS. Save with api.createEvent(event).
 */
export default function AddEvent() {
  return (
    <Page title="Add Follow-up Event" back>
      <PagePlaceholder owner="Ryan" issues={[74, 75]} wireframe="add-follow-up-event.png" />
    </Page>
  )
}
