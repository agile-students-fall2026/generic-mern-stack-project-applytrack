import { Button } from '../Button/Button'
import { Icon } from '../Icon/Icon'
import './States.css'

/**
 * Shown while data is loading.
 * @example if (loading) return <LoadingState />
 */
export function LoadingState({ message = 'Loading…' }) {
  return (
    <div className="state" role="status" aria-live="polite">
      <span className="state__spinner" aria-hidden="true" />
      <p className="state__message">{message}</p>
    </div>
  )
}

/**
 * Shown when loading or saving fails.
 * @example if (error) return <ErrorState message={error.message} onRetry={reload} />
 */
export function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="state" role="alert">
      <Icon name="alert" size={28} />
      <p className="state__message">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}

/**
 * Shown when a list has nothing in it (no applications yet, no search results...).
 *
 * @example
 * <EmptyState icon="briefcase" title="No applications yet"
 *   message="Add your first application to start tracking it."
 *   action={<Button to="/applications/new">Add application</Button>} />
 */
export function EmptyState({ icon = 'search', title, message, action }) {
  return (
    <div className="state">
      <span className="state__icon">
        <Icon name={icon} size={24} />
      </span>
      {title && <h2 className="state__title">{title}</h2>}
      {message && <p className="state__message">{message}</p>}
      {action}
    </div>
  )
}
