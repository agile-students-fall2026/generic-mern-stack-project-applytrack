import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button, FormSection, Icon, Page, TextField } from '../../components'
import { useAuth } from '../../hooks/useAuth'
import { hasNoErrors, validateEmail, validateRequired } from '../../utils/validation'
import './auth.css'

/**
 * Log In screen.
 * Issue: #11 · Wireframe: ux-design/prototype/log-in.png
 */
export default function LogIn() {
  const navigate = useNavigate()
  const location = useLocation()
  const { logIn } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState('')

  const errors = {
    email: validateEmail(form.email),
    password: validateRequired(form.password, 'Password'),
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
      await logIn(form)
      // Go back to the page the user was trying to open, or Home
      navigate(location.state?.from ?? '/home', { replace: true })
    } catch (err) {
      setFormError(err.message)
      setLoading(false)
    }
  }

  return (
    <Page title="Log In" back="/">
      <div className="auth__intro">
        <h1>Welcome back</h1>
        <p>Log in to see your applications and upcoming deadlines.</p>
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
            value={form.email}
            onChange={update('email')}
            error={shownErrors.email}
          />
          <TextField
            label="Password"
            type="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            value={form.password}
            onChange={update('password')}
            error={shownErrors.password}
          />
          <Link to="/forgot-password" className="auth__inline-link">
            Forgot password?
          </Link>
        </FormSection>

        <Button type="submit" fullWidth loading={loading}>
          Log in
        </Button>
      </form>

      <p className="auth__switch">
        Don&apos;t have an account? <Link to="/signup">Sign up</Link>
      </p>
      <p className="auth__hint">Demo account: alex.morgan@university.example · password123</p>
    </Page>
  )
}
