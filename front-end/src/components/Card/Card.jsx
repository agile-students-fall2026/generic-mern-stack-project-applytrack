import { Link } from 'react-router-dom'
import './Card.css'

/**
 * A white (or dark gray in dark mode) rounded box with a thin border. Most content sits in cards.
 *
 * @param to       makes the whole card a link to that route
 * @param onClick  makes the whole card a button
 * @param padding  "md" (default) | "none" (for cards that hold ListRows, which have their own padding)
 *
 * @example
 * <Card>Any content</Card>
 * <Card to={`/applications/${application.id}`}>...</Card>
 */
export function Card({ children, to, onClick, padding = 'md', className = '', ...rest }) {
  const classes = `card card--padding-${padding} ${to || onClick ? 'card--interactive' : ''} ${className}`

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    )
  }
  if (onClick) {
    return (
      <button type="button" className={classes} onClick={onClick} {...rest}>
        {children}
      </button>
    )
  }
  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  )
}
