import { formatDateTile } from '../../utils/format'
import './DateTile.css'

/**
 * A small calendar-style square showing the month and day ("OCT / 18"), used next to events.
 *
 * @param date  a "YYYY-MM-DD" string
 *
 * @example
 * <DateTile date={event.date} />
 */
export function DateTile({ date }) {
  const { month, day } = formatDateTile(date)
  return (
    <span className="date-tile" aria-hidden="true">
      <span className="date-tile__month">{month}</span>
      <span className="date-tile__day">{day}</span>
    </span>
  )
}
