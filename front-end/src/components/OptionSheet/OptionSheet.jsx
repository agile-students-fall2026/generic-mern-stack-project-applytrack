import { Modal } from '../Modal/Modal'
import { RadioGroup } from '../RadioGroup/RadioGroup'
import './OptionSheet.css'

/**
 * A pop-up list where the user picks one option, with a Cancel button.
 * Covers: Update status, Sort by. Picking an option calls onSelect right away.
 *
 * @param open      whether it's showing
 * @param title     e.g. "Update status"
 * @param options   list of { value, label } (constants like APPLICATION_STATUSES or SORT_OPTIONS work directly)
 * @param value     the currently selected value
 * @param onSelect  called with the chosen value
 * @param onCancel  called when the user taps Cancel or outside
 *
 * @example
 * <OptionSheet open={sortOpen} title="Sort by" options={SORT_OPTIONS} value={sort}
 *   onSelect={(value) => { setSort(value); setSortOpen(false) }} onCancel={() => setSortOpen(false)} />
 */
export function OptionSheet({ open, title, options, value, onSelect, onCancel }) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <div className="dialog__body">
        <h2 className="dialog__title">{title}</h2>
        <RadioGroup label={title} options={options} value={value} onChange={onSelect} />
      </div>
      <button type="button" className="option-sheet__cancel" onClick={onCancel}>
        Cancel
      </button>
    </Modal>
  )
}
