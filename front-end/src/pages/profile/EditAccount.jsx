import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api'
import {
  Avatar,
  Button,
  ConfirmDialog,
  ErrorState,
  FormSection,
  Icon,
  LoadingState,
  Page,
  SuccessDialog,
  TextField,
} from '../../components'
import { useApi } from '../../hooks/useApi'
import { useAuth } from '../../hooks/useAuth'
import { resizeImageFile } from '../../utils/files'
import {
  hasNoErrors,
  MIN_PASSWORD_LENGTH,
  validateEmail,
  validatePassword,
  validateRequired,
} from '../../utils/validation'
import './EditAccount.css'

/**
 * Edit Account screen: change photo, name, email and password, or delete the account.
 * Issue: #36 · Wireframe: ux-design/prototype/edit-account.png · Pop-ups: changes-saved.png, delete-account.png
 */
export default function EditAccount() {
  const { data: user, loading, error, reload } = useApi(() => api.getCurrentUser(), [])

  return (
    <Page title="Edit Account" back="/profile">
      {loading && !user && <LoadingState />}
      {error && <ErrorState message={error.message} onRetry={reload} />}
      {/* The form starts from the loaded account, so it's only shown once the data is here */}
      {user && <EditAccountForm user={user} />}
    </Page>
  )
}

function EditAccountForm({ user }) {
  const navigate = useNavigate()
  const { deleteAccount } = useAuth()
  const photoInputRef = useRef(null)

  const [form, setForm] = useState({
    fullName: user.fullName,
    email: user.email,
    avatarUrl: user.avatarUrl,
    currentPassword: '',
    newPassword: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const [photoError, setPhotoError] = useState('')
  const [serverErrors, setServerErrors] = useState({})
  const [saved, setSaved] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const changingPassword = Boolean(form.currentPassword || form.newPassword)
  const errors = {
    fullName: validateRequired(form.fullName, 'Full name'),
    email: validateEmail(form.email),
    currentPassword: changingPassword ? validateRequired(form.currentPassword, 'Current password') : '',
    newPassword: changingPassword ? validatePassword(form.newPassword) : '',
  }
  const shownErrors = submitted ? errors : {}

  function update(field) {
    return (value) => {
      setForm((current) => ({ ...current, [field]: value }))
      setServerErrors((current) => ({ ...current, [field]: '', form: '' }))
    }
  }

  async function handlePhotoChosen(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setPhotoError('')
    try {
      const avatarUrl = await resizeImageFile(file)
      setForm((current) => ({ ...current, avatarUrl }))
    } catch (err) {
      setPhotoError(err.message)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitted(true)
    if (!hasNoErrors(errors)) return

    setSaving(true)
    setServerErrors({})
    try {
      // Check the password first, so nothing is saved if the current password is wrong
      if (changingPassword) {
        await api.changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword })
      }
      await api.updateCurrentUser({ fullName: form.fullName, email: form.email, avatarUrl: form.avatarUrl })
      setSaved(true)
    } catch (err) {
      if (err.message.startsWith('Current password')) setServerErrors({ currentPassword: err.message })
      else if (err.message.includes('email')) setServerErrors({ email: err.message })
      else setServerErrors({ form: err.message })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    setDeleteError('')
    try {
      // After deleting, the app's route guard takes the user to the Welcome screen.
      await deleteAccount()
    } catch (err) {
      setDeleteError(err.message)
      setDeleting(false)
    }
  }

  return (
    <>
      <form className="stack" onSubmit={handleSubmit} noValidate>
        <div className="edit-account__photo">
          <Avatar src={form.avatarUrl} alt="Your profile photo" shape="circle" size={64} />
          <div className="stack-sm">
            <Button variant="secondary" size="sm" icon="image" onClick={() => photoInputRef.current?.click()}>
              Change photo
            </Button>
            {photoError && <p className="field__error">{photoError}</p>}
          </div>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            className="visually-hidden"
            onChange={handlePhotoChosen}
            aria-label="Choose a profile photo"
          />
        </div>

        <FormSection title="Personal info">
          <TextField
            label="Full name"
            autoComplete="name"
            value={form.fullName}
            onChange={update('fullName')}
            error={shownErrors.fullName || serverErrors.fullName}
          />
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={update('email')}
            error={shownErrors.email || serverErrors.email}
          />
        </FormSection>

        <FormSection title="Password">
          <TextField
            label="Current password"
            type="password"
            autoComplete="current-password"
            hint="Only needed if you're changing your password"
            value={form.currentPassword}
            onChange={update('currentPassword')}
            error={shownErrors.currentPassword || serverErrors.currentPassword}
          />
          <TextField
            label="New password"
            type="password"
            autoComplete="new-password"
            hint={`At least ${MIN_PASSWORD_LENGTH} characters`}
            value={form.newPassword}
            onChange={update('newPassword')}
            error={shownErrors.newPassword}
          />
        </FormSection>

        {serverErrors.form && (
          <p className="field__error" role="alert">
            {serverErrors.form}
          </p>
        )}

        <Button type="submit" fullWidth loading={saving}>
          Save changes
        </Button>
        <Button variant="danger" fullWidth icon="trash" onClick={() => setConfirmDelete(true)}>
          Delete account
        </Button>
      </form>

      <SuccessDialog
        open={saved}
        title="Changes saved"
        message="Your account details have been updated."
        onDone={() => navigate('/profile')}
      />

      <ConfirmDialog
        open={confirmDelete}
        title="Delete your account?"
        message={
          deleteError ? (
            <span className="edit-account__delete-error">
              <Icon name="alert" size={16} /> {deleteError}
            </span>
          ) : (
            "This permanently deletes your account and logs you out. This can't be undone."
          )
        }
        confirmLabel="Delete account"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </>
  )
}
