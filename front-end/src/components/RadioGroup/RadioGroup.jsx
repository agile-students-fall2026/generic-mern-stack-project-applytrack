import { useId } from 'react'
import './RadioGroup.css'

/**
 * A vertical list of options where one can be picked, shown inside a card
 * (e.g. Export format: CSV / PDF). Also used inside <OptionSheet>.
 *
 * @param options   list of { value, label, disabled? }
 * @param value     selected value
 * @param onChange  called with the newly selected value
 *
 * @example
 * import { EXPORT_FORMATS } from '../../constants'
 * <RadioGroup label="Format" options={EXPORT_FORMATS} value={format} onChange={setFormat} />
 */
export function RadioGroup({ label, options, value, onChange, name }) {
  const generatedName = useId()
  const groupName = name ?? generatedName

  return (
    <fieldset className="radio-group">
      {label && <legend className="visually-hidden">{label}</legend>}
      {options.map((option) => {
        const selected = option.value === value
        return (
          <label
            key={option.value}
            className={`radio-group__option ${selected ? 'radio-group__option--selected' : ''} ${
              option.disabled ? 'radio-group__option--disabled' : ''
            }`}
          >
            <input
              type="radio"
              name={groupName}
              value={option.value}
              checked={selected}
              disabled={option.disabled}
              onChange={() => onChange?.(option.value)}
              className="radio-group__input"
            />
            <span className="radio-group__dot" aria-hidden="true" />
            <span>{option.label}</span>
          </label>
        )
      })}
    </fieldset>
  )
}
