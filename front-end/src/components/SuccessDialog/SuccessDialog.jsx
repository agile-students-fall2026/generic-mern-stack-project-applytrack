import { Button } from '../Button/Button'
import { Icon } from '../Icon/Icon'
import { Modal } from '../Modal/Modal'
import './SuccessDialog.css'

/**
 * A "✓ Done!" pop-up shown after something is saved.
 * Covers: Application saved, Changes saved, Event saved, Offer saved, Round saved, Settings saved,
 * Account created, Password updated, Reset link sent, Export complete.
 *
 * @param open       whether it's showing
 * @param title      e.g. "Application saved"
 * @param message    optional extra line, e.g. "You can find it on your dashboard."
 * @param doneLabel  button text (default "Done")
 * @param onDone     called when the user taps the button (usually navigate somewhere)
 *
 * @example
 * <SuccessDialog open={saved} title="Application saved" onDone={() => navigate(`/applications/${id}`)} />
 */
export function SuccessDialog({ open, title, message, doneLabel = 'Done', onDone }) {
  return (
    <Modal open={open} onClose={onDone} title={title}>
      <div className="dialog__body success-dialog__body">
        <span className="success-dialog__icon">
          <Icon name="check" size={26} />
        </span>
        <h2 className="dialog__title">{title}</h2>
        {message && <p className="dialog__message">{message}</p>}
      </div>
      <div className="dialog__actions dialog__actions--single">
        <Button onClick={onDone}>{doneLabel}</Button>
      </div>
    </Modal>
  )
}
