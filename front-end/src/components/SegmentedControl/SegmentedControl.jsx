import { useId } from 'react'
import './SegmentedControl.css'

/**
 * A row of buttons where exactly one is selected, e.g. Internship / Full-time / Part-time,
 * or Pending / Accepted / Declined.
 *
 * @param options   list of { value, label }
 * @param value     selected value
 * @param onChange  called with the newly selected value
 *
 * @example
 * import { JOB_TYPES } from '../../constants'
 * <SegmentedControl label="Job type" options={JOB_TYPES} value={jobType} onChange={setJobType} />
 */
export function SegmentedControl({ label, options, value, onChange }) {
  const labelId = useId()

  return (
    <div className="segmented">
      {label && (
        <span className="field__label" id={labelId}>
          {label}
        </span>
      )}
      <div className="segmented__options" role="radiogroup" aria-labelledby={label ? labelId : undefined}>
        {options.map((option) => {
          const selected = option.value === value
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              className={`segmented__option ${selected ? 'segmented__option--selected' : ''}`}
              onClick={() => onChange?.(option.value)}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
