import { formatShortDate } from '../../utils/format'
import { Avatar } from '../Avatar/Avatar'
import { Card } from '../Card/Card'
import { StatusBadge } from '../StatusBadge/StatusBadge'
import './ApplicationCard.css'

/**
 * One application in a list: logo, company, position, date applied and status.
 * Used on Home (recent applications), Dashboard and Archive.
 *
 * @param application  an application object from the api
 * @param to           where tapping goes (default: its details page)
 * @param trailing     optional element on the right instead of the status badge (e.g. an "Unarchive" button)
 *
 * @example
 * {applications.map((application) => <ApplicationCard key={application.id} application={application} />)}
 */
export function ApplicationCard({ application, to, trailing }) {
  const { id, company, position, dateApplied, status, logoUrl, location } = application

  const body = (
    <>
      <Avatar src={logoUrl} alt={`${company} logo`} />
      <span className="application-card__text">
        <span className="application-card__company">{company}</span>
        <span className="application-card__meta">{position}</span>
        <span className="application-card__meta">
          {trailing ? location : `Applied ${formatShortDate(dateApplied)}`}
        </span>
      </span>
    </>
  )

  // When there's a trailing button, only the left part is a link, so the button stays clickable on its own.
  if (trailing) {
    return (
      <Card className="application-card">
        <Card to={to ?? `/applications/${id}`} padding="none" className="application-card__link">
          {body}
        </Card>
        {trailing}
      </Card>
    )
  }

  return (
    <Card to={to ?? `/applications/${id}`} className="application-card">
      {body}
      <StatusBadge status={status} short />
    </Card>
  )
}
