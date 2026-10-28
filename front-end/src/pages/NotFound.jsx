import { Button, EmptyState, Page } from '../components'

/** Shown for any URL that doesn't match a screen. */
export default function NotFound() {
  return (
    <Page title="Page not found" back="/home">
      <EmptyState
        icon="alert"
        title="This page doesn't exist"
        message="The link may be broken, or the page may have moved."
        action={<Button to="/home">Go to home</Button>}
      />
    </Page>
  )
}
