import { Page, PagePlaceholder } from '../../components'

/**
 * Statistics screen.
 * Owner: Ryan · Issues: #77
 * Wireframe: ux-design/prototype/statistics.png
 *
 * Load with api.getStatistics(); use StatCard in a .stat-grid.
 */
export default function Statistics() {
  return (
    <Page title="Statistics">
      <PagePlaceholder owner="Ryan" issues={[77]} wireframe="statistics.png" />
    </Page>
  )
}
