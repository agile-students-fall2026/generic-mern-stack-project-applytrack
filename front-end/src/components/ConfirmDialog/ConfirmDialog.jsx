import { Button } from '../Button/Button'
import { Modal } from '../Modal/Modal'

/**
 * An "Are you sure?" pop-up with Cancel and a confirm button.
 * Covers: Delete application, Delete event, Delete account, Archive/Unarchive, Log out.
 *
 * @param open          whether it's showing
 * @param title         e.g. "Delete application?"
 * @param message       e.g. "This can't be undone."
 * @param confirmLabel  text of the confirm button, e.g. "Delete" (default "Confirm")
 * @param onConfirm     called when the user confirms
 * @param onCancel      called when the user cancels or taps outside
 * @param loading       disables the buttons while the action runs
 *
 * @example
 * const [confirmOpen, setConfirmOpen] = useState(false)
 * <ConfirmDialog open={confirmOpen} title="Delete application?" message="This can't be undone."
 *   confirmLabel="Delete" onConfirm={handleDelete} onCancel={() => setConfirmOpen(false)} />
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
}) {
  return (
    <Modal open={open} onClose={loading ? undefined : onCancel} title={title}>
      <div className="dialog__body">
        <h2 className="dialog__title">{title}</h2>
        {message && <p className="dialog__message">{message}</p>}
      </div>
      <div className="dialog__actions">
        <Button variant="secondary" onClick={onCancel} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
