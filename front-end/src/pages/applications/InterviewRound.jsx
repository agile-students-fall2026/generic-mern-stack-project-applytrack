import { Page, PagePlaceholder } from '../../components'

/**
 * Interview Round screen.
 * Owner: Ryan · Issues: #15
 * Wireframe: ux-design/prototype/add-edit-interview-round.png · Pop-ups: round-saved.png
 *
 * Used for both adding and editing: if useParams() has a roundId, you're editing.
 */
export default function InterviewRound() {
  return (
    <Page title="Interview Round" back>
      <PagePlaceholder owner="Ryan" issues={[15]} wireframe="add-edit-interview-round.png" />
    </Page>
  )
}
