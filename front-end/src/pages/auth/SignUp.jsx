import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, FormSection, Icon, Page, SuccessDialog, TextField } from '../../components'
import { useAuth } from '../../hooks/useAuth'
import {
  hasNoErrors,
  MIN_PASSWORD_LENGTH,
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  validateRequired,
} from '../../utils/validation'
import './auth.css'

/**
 * Sign Up screen: create an account.
 * Issue: #6 · Wireframe: ux-design/prototype/sign-up.png · Pop-up: account-created.png
 */
export default function SignUp() {
  const navigate = useNavigate()
  const { signUp } = useAuth()
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' })
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [created, setCreated] = useState(false)

  const errors = {
    fullName: validateRequired(form.fullName, 'Full name'),
    email: validateEmail(form.email),
    password: validatePassword(form.password),
    confirmPassword: validatePasswordMatch(form.password, form.confirmPassword),
  }
  // Only show field errors after the first attempt to submit, then update them as the user types
  const shownErrors = submitted ? errors : {}

  function update(field) {
    return (value) => {
      setForm((current) => ({ ...current, [field]: value }))
      setFormError('')
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitted(true)
    if (!hasNoErrors(errors)) return

    setSaving(true)
    try {
      await signUp({ fullName: form.fullName, email: form.email, password: form.password })
      setCreated(true)
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Page title="Sign Up" back="/">
      <div className="auth__intro">
        <h1>Create your account</h1>
      </div>

      <form className="auth__form" onSubmit={handleSubmit} noValidate>
        {formError && (
          <p className="auth__form-error" role="alert">
            <Icon name="alert" size={18} />
            {formError}
          </p>
        )}

        <FormSection>
          <TextField
            label="Full name"
            placeholder="e.g. Estifanos Iradukunda"
            autoComplete="name"
            value={form.fullName}
            onChange={update('fullName')}
            error={shownErrors.fullName}
          />
          <TextField
            label="Email"
            type="email"
            placeholder="Enter your email address"
            autoComplete="email"
            value={form.email}
            onChange={update('email')}
            error={shownErrors.email}
          />
          <TextField
            label="Password"
            type="password"
            placeholder="Enter password"
            autoComplete="new-password"
            hint={`At least ${MIN_PASSWORD_LENGTH} characters`}
            value={form.password}
            onChange={update('password')}
            error={shownErrors.password}
          />
          <TextField
            label="Confirm password"
            type="password"
            placeholder="Re-enter password"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={update('confirmPassword')}
            error={shownErrors.confirmPassword}
          />
        </FormSection>

        <Button type="submit" fullWidth loading={saving}>
          Create account
        </Button>
      </form>

      <p className="auth__switch">
        Already have an account? <Link to="/login">Log in</Link>
      </p>

      <SuccessDialog
        open={created}
        title="Account created!"
        message="Welcome to ApplyTrack"
        doneLabel="Get started"
        onDone={() => navigate('/home', { replace: true })}
      />
    </Page>
  )
}
