import { Link } from 'react-router-dom'
import './SectionHeader.css'

/**
 * The small uppercase label above a group of content, with an optional link or button on the right.
 * Examples from the wireframes: "NEXT UP · See all", "UPCOMING EVENTS · + Add event".
 *
 * @param title        the label (it's shown in uppercase automatically)
 * @param actionLabel  text of the right-side link/button
 * @param actionTo     route for the right-side link
 * @param onAction     click handler, if it's a button instead of a link
 *
 * @example
 * <SectionHeader title="Next up" actionLabel="See all" actionTo="/upcoming" />
 * <SectionHeader title="Interview rounds" actionLabel="+ Add round" actionTo={`/applications/${id}/rounds/new`} />
 */
export function SectionHeader({ title, actionLabel, actionTo, onAction }) {
  return (
    <div className="section-header">
      <h2 className="section-label">{title}</h2>
      {actionLabel && actionTo && (
        <Link to={actionTo} className="section-header__action">
          {actionLabel}
        </Link>
      )}
      {actionLabel && !actionTo && onAction && (
        <button type="button" className="section-header__action" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}
