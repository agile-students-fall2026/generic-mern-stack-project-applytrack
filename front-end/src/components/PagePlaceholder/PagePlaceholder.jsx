import { Card } from '../Card/Card'
import './PagePlaceholder.css'

/**
 * TEMPORARY. Marks a page that hasn't been built yet, and says who owns it.
 * Delete it from your page as soon as you start building the real screen.
 */
export function PagePlaceholder({ owner, issues = [], wireframe, children }) {
  return (
    <Card className="page-placeholder">
      <p className="page-placeholder__label">Not built yet</p>
      {owner && (
        <p>
          <strong>Owner:</strong> {owner}
        </p>
      )}
      {issues.length > 0 && (
        <p>
          <strong>Issues:</strong> {issues.map((issue) => `#${issue}`).join(', ')}
        </p>
      )}
      {wireframe && (
        <p>
          <strong>Wireframe:</strong> ux-design/prototype/{wireframe}
        </p>
      )}
      {children}
    </Card>
  )
}
