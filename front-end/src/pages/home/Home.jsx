import { Page, PagePlaceholder } from '../../components'

/**
 * Home screen.
 * Owner: Unassigned
 * Wireframe: ux-design/prototype/home.png
 *
 * Summary: stat cards, Next up events and recent applications. Use StatCard, EventCard, ApplicationCard.
 */
export default function Home() {
  return (
    <Page title="Home">
      <PagePlaceholder owner="Unassigned" issues={[]} wireframe="home.png" />
    </Page>
  )
}
