import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import './Modal.css'

/**
 * The base pop-up: a dark backdrop with a box in the middle of the screen.
 * Closes when the user taps the backdrop or presses Escape.
 *
 * Usually you want one of the ready-made dialogs instead:
 * ConfirmDialog (Are you sure?), SuccessDialog (✓ Saved) or OptionSheet (pick one option).
 * Use Modal directly only for a custom pop-up, e.g. the duplicate application warning.
 *
 * @param open     whether it's showing
 * @param onClose  called when the user taps outside or presses Escape
 * @param title    heading text (also used for screen readers)
 *
 * @example
 * <Modal open={isOpen} onClose={() => setIsOpen(false)} title="Possible duplicate">
 *   ...content and buttons...
 * </Modal>
 */
export function Modal({ open, onClose, title, children, className = '' }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', handleKeyDown)

    // Stop the page behind the pop-up from scrolling
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // Move keyboard focus into the pop-up
    dialogRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="modal__backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose?.()}>
      <div
        ref={dialogRef}
        className={`modal ${className}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
      >
        {children}
      </div>
    </div>,
    document.body,
  )
}
