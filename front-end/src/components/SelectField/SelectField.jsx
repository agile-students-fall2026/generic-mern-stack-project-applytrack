import { useId } from 'react'
import { Field } from '../Field/Field'
import { Icon } from '../Icon/Icon'
import './SelectField.css'

/**
 * A labeled dropdown.
 *
 * @param options      list of { value, label } (the lists in src/constants work directly)
 * @param value        selected value
 * @param onChange     called with the new value
 * @param placeholder  optional first option shown when nothing is selected
 *
 * @example
 * import { APPLICATION_STATUSES } from '../../constants'
 * <SelectField label="Status" options={APPLICATION_STATUSES} value={status} onChange={setStatus} />
 */
export function SelectField({ label, options, value, onChange, placeholder, required, hint, error, id, ...rest }) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <Field id={inputId} label={label} required={required} hint={hint} error={error}>
      <div className="select">
        <select
          id={inputId}
          className="input select__control"
          value={value ?? ''}
          onChange={(event) => onChange?.(event.target.value)}
          required={required}
          aria-invalid={Boolean(error)}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Icon name="chevron-down" size={18} className="select__chevron" />
      </div>
    </Field>
  )
}
