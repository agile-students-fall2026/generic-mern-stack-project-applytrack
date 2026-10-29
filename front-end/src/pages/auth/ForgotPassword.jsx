import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api'
import { Button, FormSection, Icon, Page, SuccessDialog, TextField } from '../../components'
import { validateEmail } from '../../utils/validation'
import './auth.css'

/**
 * Forgot Password screen: request a password reset link.
 * Issue: #58 · Wireframe: ux-design/prototype/forgot-password.png · Pop-up: reset-link-sent.png
 *
 * No email is really sent yet, so the success pop-up also offers a demo link to the Reset Password screen.
 */
export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [sent, setSent] = useState(false)

  const emailError = validateEmail(email)

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitted(true)
    if (emailError) return

    setLoading(true)
    try {
      await api.requestPasswordReset({ email })
      setSent(true)
    } catch (err) {
      setFormError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Page title="Forgot Password" back="/login">
      <div className="auth__intro">
        <h1>Forgot your password?</h1>
        <p>Enter the email you signed up with.</p>
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
            label="Email"
            type="email"
            placeholder="email@company.com"
            autoComplete="email"
            value={email}
            onChange={(value) => {
              setEmail(value)
              setFormError('')
            }}
            error={submitted ? emailError : ''}
          />
        </FormSection>

        <Button type="submit" fullWidth loading={loading}>
          Send reset link
        </Button>
        <Button variant="ghost" fullWidth to="/login">
          Back to log in
        </Button>
      </form>

      <SuccessDialog
        open={sent}
        title="Check your email"
        message={`If an account exists for ${email.trim()}, we've sent a link to reset your password.`}
        doneLabel="Back to log in"
        onDone={() => navigate('/login', { replace: true })}
        secondaryLabel="Open reset link (demo)"
        onSecondary={() => navigate('/reset-password', { replace: true })}
      />
    </Page>
  )
}
