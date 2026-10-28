import { useId } from 'react'
import { Field } from '../Field/Field'

/**
 * A labeled text input. Also handles email, password, date, time, url and tel inputs via `type`.
 *
 * @param label     text above the input
 * @param type      "text" (default) | "email" | "password" | "date" | "time" | "url" | "tel" | "number"
 * @param value     current value (controlled input)
 * @param onChange  called with the NEW VALUE (a string), not the event
 * @param required  adds a "*" to the label and the browser's required check
 * @param hint      small helper text under the input
 * @param error     error message; turns the input red
 *
 * @example
 * const [company, setCompany] = useState('')
 * <TextField label="Company" required placeholder="e.g. Stripe" value={company} onChange={setCompany} />
 * <TextField label="Date applied" type="date" value={date} onChange={setDate} />
 */
export function TextField({ label, value, onChange, required, hint, error, type = 'text', id, ...rest }) {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <Field id={inputId} label={label} required={required} hint={hint} error={error}>
      <input
        id={inputId}
        className="input"
        type={type}
        value={value ?? ''}
        onChange={(event) => onChange?.(event.target.value)}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        {...rest}
      />
    </Field>
  )
}
