import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api'
import {
  Button,
  ErrorState,
  FormSection,
  LoadingState,
  Page,
  SelectField,
  SuccessDialog,
  Switch,
} from '../../components'
import { REMINDER_OPTIONS } from '../../constants'
import { useApi } from '../../hooks/useApi'

/**
 * Notification Settings screen: choose which reminders to get and the default reminder time.
 * Issue: #75 · Wireframe: ux-design/prototype/notification-settings.png · Pop-up: settings-saved.png
 */
export default function NotificationSettings() {
  const navigate = useNavigate()
  const { data: settings, setData: setSettings, loading, error, reload } = useApi(
    () => api.getNotificationSettings(),
    [],
  )
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saved, setSaved] = useState(false)

  function update(field, value) {
    setSettings({ ...settings, [field]: value })
  }

  async function save() {
    setSaving(true)
    setSaveError('')
    try {
      await api.updateNotificationSettings(settings)
      setSaved(true)
    } catch (err) {
      setSaveError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const footer = settings && (
    <>
      {saveError && <p className="field__error">{saveError}</p>}
      <Button fullWidth loading={saving} onClick={save}>
        Save changes
      </Button>
    </>
  )

  return (
    <Page title="Notification Settings" back footer={footer}>
      {loading && !settings && <LoadingState />}
      {error && <ErrorState message={error.message} onRetry={reload} />}

      {settings && (
        <FormSection title="Remind me about">
          <Switch
            label="Deadlines"
            checked={settings.deadlineReminders}
            onChange={(value) => update('deadlineReminders', value)}
          />
          <Switch
            label="Interviews"
            checked={settings.interviewReminders}
            onChange={(value) => update('interviewReminders', value)}
          />
          <Switch
            label="Follow-ups"
            checked={settings.followUpReminders}
            onChange={(value) => update('followUpReminders', value)}
          />
          <SelectField
            label="Default reminder time"
            options={REMINDER_OPTIONS}
            value={settings.defaultReminder}
            onChange={(value) => update('defaultReminder', value)}
          />
        </FormSection>
      )}

      <SuccessDialog
        open={saved}
        title="Settings saved"
        message="Your reminder preferences have been updated."
        onDone={() => navigate('/profile')}
      />
    </Page>
  )
}
