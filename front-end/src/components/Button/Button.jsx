import { Link } from 'react-router-dom'
import { Icon } from '../Icon/Icon'
import './Button.css'

/**
 * The app's main button.
 *
 * @param variant   "primary" (solid, default) | "secondary" (outlined) | "ghost" (text only) | "danger" (red text)
 * @param size      "md" (default) | "sm"
 * @param fullWidth stretch to the width of its container
 * @param icon      optional icon name shown before the text, e.g. "plus"
 * @param loading   shows "..." and disables the button while saving
 * @param to        if given, renders a link to that route instead of a <button>
 *
 * @example
 * <Button fullWidth onClick={save}>Save application</Button>
 * <Button variant="secondary" to="/login">Log in</Button>
 * <Button variant="danger" icon="trash" onClick={openDeleteDialog}>Delete application</Button>
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  loading = false,
  disabled = false,
  to,
  type = 'button',
  className = '',
  ...rest
}) {
  const classes = [
    'button',
    `button--${variant}`,
    `button--${size}`,
    fullWidth ? 'button--full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const content = (
    <>
      {icon && <Icon name={icon} size={size === 'sm' ? 16 : 18} />}
      <span>{loading ? 'Please wait…' : children}</span>
    </>
  )

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    )
  }

  return (
    <button type={type} className={classes} disabled={disabled || loading} {...rest}>
      {content}
    </button>
  )
}
