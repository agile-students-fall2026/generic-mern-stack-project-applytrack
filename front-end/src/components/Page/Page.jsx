import { BackButton } from '../BackButton/BackButton'
import './Page.css'

/**
 * The layout every screen uses. It gives you the header, the scrolling content area and an
 * optional button bar fixed to the bottom of the screen.
 *
 * Two header styles, matching the wireframes:
 * - With `back`: a small title next to a "<" arrow (Add Application, Edit Account, ...)
 * - Without `back`: a large title (Home, Applications, Profile, ...)
 *
 * @param title     text shown in the header
 * @param subtitle  optional smaller text under a large title ("Here's your recruiting at a glance")
 * @param back      true = go to previous page, or a route like "/profile" to go somewhere specific
 * @param action    optional element shown on the right of the header, e.g. an "Edit" button or "+" IconButton
 * @param footer    optional element fixed to the bottom, e.g. <Button fullWidth>Save</Button>
 * @param hideHeader  hide the header entirely (Welcome screen)
 *
 * @example
 * <Page title="Add Application" back footer={<Button fullWidth onClick={save}>Save application</Button>}>
 *   ...form...
 * </Page>
 */
export function Page({ title, subtitle, back, action, footer, hideHeader = false, children, className = '' }) {
  const isLarge = !back

  return (
    <div className={`page ${footer ? 'page--with-footer' : ''} ${className}`}>
      {!hideHeader && (
        <header className={`page__header ${isLarge ? 'page__header--large' : 'page__header--small'}`}>
          <div className="page__header-main">
            {back && <BackButton to={typeof back === 'string' ? back : undefined} />}
            <div className="page__titles">
              {title && (isLarge ? <h1>{title}</h1> : <h1 className="page__title-small">{title}</h1>)}
              {subtitle && <p className="page__subtitle">{subtitle}</p>}
            </div>
          </div>
          {action && <div className="page__action">{action}</div>}
        </header>
      )}

      <main className="page__content">{children}</main>

      {footer && <div className="page__footer">{footer}</div>}
    </div>
  )
}
