import { Card } from '../Card/Card'
import './StatCard.css'

/**
 * A big number with a label, like "24 · Total applied" on Home and Statistics.
 * Put several in a <div className="stat-grid"> to lay them out in columns.
 *
 * @example
 * <div className="stat-grid">
 *   <StatCard value={stats.totalApplied} label="Total applied" />
 *   <StatCard value={stats.active} label="Active" />
 * </div>
 */
export function StatCard({ value, label }) {
  return (
    <Card className="stat-card">
      <span className="stat-card__value">{value}</span>
      <span className="stat-card__label">{label}</span>
    </Card>
  )
}
