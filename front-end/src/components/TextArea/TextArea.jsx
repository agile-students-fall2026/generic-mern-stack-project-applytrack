import { useId } from 'react'
import { Field } from '../Field/Field'

/**
 * A labeled multi-line text box, for notes.
 * Same props as TextField; `onChange` receives the new value.
 *
 * @example
 * <TextArea label="Notes" placeholder="Any other notes" value={notes} onChange={setNotes} />
 */
export function TextArea({ label, value, onChange, required, hint, error, rows = 4, id, ...rest }) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <Field id={inputId} label={label} required={required} hint={hint} error={error}>
      <textarea
        id={inputId}
        className="input"
        rows={rows}
        value={value ?? ''}
        onChange={(event) => onChange?.(event.target.value)}
        required={required}
        aria-invalid={Boolean(error)}
        {...rest}
      />
    </Field>
  )
}
