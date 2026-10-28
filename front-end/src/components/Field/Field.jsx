import './Field.css'

/**
 * The label + hint + error message wrapper used by every form input.
 * You normally use TextField, TextArea or SelectField instead of this directly.
 */
export function Field({ id, label, required, hint, error, children }) {
  return (
    <div className={`field ${error ? 'field--error' : ''}`}>
      {label && (
        <label className="field__label" htmlFor={id}>
          {label}
          {required && <span className="field__required" aria-hidden="true"> *</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="field__error" id={`${id}-error`} role="alert">
          {error}
        </p>
      ) : (
        hint && (
          <p className="field__hint" id={`${id}-hint`}>
            {hint}
          </p>
        )
      )}
    </div>
  )
}
