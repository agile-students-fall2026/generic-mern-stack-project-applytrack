import { IconButton, Page, PagePlaceholder } from '../../components'

/**
 * Applications screen.
 * Owner: Estifanos · Issues: #39, #63, #18
 * Wireframe: ux-design/prototype/dashboard.png · Pop-ups: sort-menu.png
 *
 * Search (SearchBar), status filter (FilterChips), sort (OptionSheet + SORT_OPTIONS), list (ApplicationCard), 'View archived' link to /archive.
 */
export default function Dashboard() {
  return (
    <Page title="Applications" action={<IconButton icon="plus" label="Add application" variant="primary" to="/applications/new" />}>
      <PagePlaceholder owner="Estifanos" issues={[39, 63, 18]} wireframe="dashboard.png" />
    </Page>
  )
}
