import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api'
import { Button, FormSection, Icon, Page, SuccessDialog, TextField } from '../../components'
import {
  hasNoErrors,
  MIN_PASSWORD_LENGTH,
  validatePassword,
  validatePasswordMatch,
} from '../../utils/validation'
import './auth.css'

/**
 * Reset Password screen: choose a new password (opened from the reset link).
 * Issue: #58 · Wireframe: ux-design/prototype/reset-password.png · Pop-up: password-updated.png
 */
export default function ResetPassword() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [updated, setUpdated] = useState(false)

  const errors = {
    newPassword: validatePassword(form.newPassword),
    confirmPassword: validatePasswordMatch(form.newPassword, form.confirmPassword),
  }
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

    setLoading(true)
    try {
      await api.resetPassword({ newPassword: form.newPassword })
      setUpdated(true)
    } catch (err) {
      setFormError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Page title="Reset Password" back="/login">
      <div className="auth__intro">
        <h1>Set a new password</h1>
        <p>Choose a password you have not used before.</p>
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
            label="New password"
            type="password"
            autoComplete="new-password"
            hint={`At least ${MIN_PASSWORD_LENGTH} characters`}
            value={form.newPassword}
            onChange={update('newPassword')}
            error={shownErrors.newPassword}
          />
          <TextField
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={update('confirmPassword')}
            error={shownErrors.confirmPassword}
          />
        </FormSection>

        <Button type="submit" fullWidth loading={loading}>
          Update password
        </Button>
      </form>

      <SuccessDialog
        open={updated}
        title="Password updated"
        message="You can now log in with your new password."
        doneLabel="Log in"
        onDone={() => navigate('/login', { replace: true })}
      />
    </Page>
  )
}
