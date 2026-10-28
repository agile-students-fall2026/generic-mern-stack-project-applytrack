import { Link } from 'react-router-dom'
import { Icon } from '../Icon/Icon'
import './IconButton.css'

/**
 * A square button that only shows an icon, like the "+" on Applications and Upcoming.
 *
 * @param icon     icon name, e.g. "plus"
 * @param label    required: describes the action for screen readers, e.g. "Add application"
 * @param variant  "primary" (solid square) | "ghost" (no background, default)
 * @param to       if given, renders a link instead of a <button>
 *
 * @example
 * <IconButton icon="plus" label="Add application" variant="primary" to="/applications/new" />
 */
export function IconButton({ icon, label, variant = 'ghost', to, className = '', type = 'button', ...rest }) {
  const classes = `icon-button icon-button--${variant} ${className}`
  const content = <Icon name={icon} size={22} />

  if (to) {
    return (
      <Link to={to} className={classes} aria-label={label} title={label} {...rest}>
        {content}
      </Link>
    )
  }

  return (
    <button type={type} className={classes} aria-label={label} title={label} {...rest}>
      {content}
    </button>
  )
}
