import { useId } from 'react'
import './Switch.css'

/**
 * An on/off toggle with a label, e.g. "Remind me" or "Include archived applications".
 *
 * @param checked   true when on
 * @param onChange  called with the new true/false value
 *
 * @example
 * <Switch label="Remind me" checked={remind} onChange={setRemind} />
 */
export function Switch({ label, description, checked, onChange, disabled }) {
  const id = useId()

  return (
    <div className="switch-row">
      <label className="switch-row__text" htmlFor={id}>
        <span>{label}</span>
        {description && <span className="switch-row__description">{description}</span>}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={Boolean(checked)}
        disabled={disabled}
        className={`switch ${checked ? 'switch--on' : ''}`}
        onClick={() => onChange?.(!checked)}
      >
        <span className="switch__thumb" />
      </button>
    </div>
  )
}
