import { useNavigate } from 'react-router-dom'
import { Icon } from '../Icon/Icon'
import './BackButton.css'

/**
 * The "<" back arrow shown at the top left of inner pages.
 * You usually don't need this directly: <Page back> adds it for you.
 *
 * @param to  where to go. If left out, it goes back to the previous page (like the browser back button).
 */
export function BackButton({ to }) {
  const navigate = useNavigate()

  function goBack() {
    // If someone opened this page directly (no history), fall back to the home page.
    if (to) navigate(to)
    else if (window.history.state?.idx > 0) navigate(-1)
    else navigate('/home')
  }

  return (
    <button type="button" className="back-button" onClick={goBack} aria-label="Go back">
      <Icon name="chevron-left" size={24} />
    </button>
  )
}
