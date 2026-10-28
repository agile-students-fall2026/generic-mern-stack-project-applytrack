import { Link } from 'react-router-dom'
import { Icon } from '../Icon/Icon'
import './ListRow.css'

/**
 * One row in a list, like "Edit account  >" on Profile or "View job posting" on Application Details.
 * Put several inside <Card padding="none"> and they get dividers automatically.
 *
 * @param icon      optional icon name on the left
 * @param title     main text
 * @param subtitle  optional smaller gray text underneath
 * @param to        route to open when tapped (shows a ">" chevron)
 * @param href      external link to open in a new tab (shows an external-link icon)
 * @param onClick   action when tapped
 * @param trailing  optional element on the right instead of the chevron (e.g. a badge or "time")
 *
 * @example
 * <Card padding="none">
 *   <ListRow icon="pencil" title="Edit account" to="/profile/edit" />
 *   <ListRow icon="download" title="Export data" to="/profile/export" />
 * </Card>
 */
export function ListRow({ icon, title, subtitle, to, href, onClick, trailing, className = '' }) {
  const content = (
    <>
      {icon && <Icon name={icon} size={20} className="list-row__icon" />}
      <span className="list-row__text">
        <span className="list-row__title">{title}</span>
        {subtitle && <span className="list-row__subtitle">{subtitle}</span>}
      </span>
      {trailing ??
        (to ? (
          <Icon name="chevron-right" size={18} className="list-row__chevron" />
        ) : href ? (
          <Icon name="external" size={18} className="list-row__chevron" />
        ) : null)}
    </>
  )

  const classes = `list-row ${to || href || onClick ? 'list-row--interactive' : ''} ${className}`

  if (to) {
    return (
      <Link to={to} className={classes}>
        {content}
      </Link>
    )
  }
  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={classes}>
        {content}
      </a>
    )
  }
  if (onClick) {
    return (
      <button type="button" className={classes} onClick={onClick}>
        {content}
      </button>
    )
  }
  return <div className={classes}>{content}</div>
}
