import { Card } from '../Card/Card'
import './FormSection.css'

/**
 * A titled group of form fields inside a card, like "JOB", "RECRUITER CONTACT" or "PASSWORD"
 * in the wireframes. Put TextFields, SelectFields etc. inside.
 *
 * @example
 * <FormSection title="Job">
 *   <TextField label="Company" required value={company} onChange={setCompany} />
 *   <TextField label="Position" required value={position} onChange={setPosition} />
 * </FormSection>
 */
export function FormSection({ title, children }) {
  return (
    <section className="form-section">
      {title && <h2 className="section-label">{title}</h2>}
      <Card className="form-section__card">{children}</Card>
    </section>
  )
}
