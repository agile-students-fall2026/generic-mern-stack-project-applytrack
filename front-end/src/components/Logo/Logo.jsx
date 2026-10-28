import { LOGO_ASPECT_RATIO, LOGO_PATH, LOGO_VIEWBOX } from './logoPath'
import './Logo.css'

/**
 * The ApplyTrack "AT" logo. It's a vector drawn in the current text color, so it's black in the
 * light theme and white in the dark theme automatically, and sharp at any size.
 *
 * @param height    height in pixels. Suggested sizes:
 *                  64 on Welcome / splash, 28 next to the wordmark in headers, 20 inline.
 * @param wordmark  also show the "ApplyTrack" name next to the mark
 *
 * @example
 * <Logo height={64} />              // big mark on the Welcome screen
 * <Logo height={28} wordmark />     // mark + name, e.g. a header
 */
export function Logo({ height = 32, wordmark = false, className = '' }) {
  const width = Math.round(height * LOGO_ASPECT_RATIO)

  return (
    <span className={`logo ${className}`} style={{ '--logo-height': `${height}px` }}>
      <svg
        className="logo__mark"
        width={width}
        height={height}
        viewBox={LOGO_VIEWBOX}
        role="img"
        aria-label={wordmark ? undefined : 'ApplyTrack'}
        aria-hidden={wordmark ? true : undefined}
      >
        <path fill="currentColor" fillRule="evenodd" d={LOGO_PATH} />
      </svg>
      {wordmark && <span className="logo__wordmark">ApplyTrack</span>}
    </span>
  )
}
