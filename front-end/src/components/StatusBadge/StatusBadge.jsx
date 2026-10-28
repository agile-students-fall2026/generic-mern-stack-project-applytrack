import { getStatus } from '../../constants'
import './StatusBadge.css'

/**
 * Shows an application's recruiting status as a small pill, styled like the wireframes:
 * early stages are gray, Interview/Offer are solid, Rejected is outlined.
 *
 * @param status  a status value from APPLICATION_STATUSES, e.g. "online-assessment"
 * @param short   use the short label ("OA" instead of "Online Assessment")
 *
 * @example
 * <StatusBadge status={application.status} short />
 */
export function StatusBadge({ status, short = false }) {
  const info = getStatus(status)
  return <span className={`status-badge status-badge--${info.badge}`}>{short ? info.shortLabel : info.label}</span>
}
