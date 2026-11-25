import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import AuthShell from '../components/AuthShell.jsx'
import Field from '../components/Field.jsx'
import { api } from '../api.js'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [form, setForm] = useState({ newPassword: '', confirmNewPassword: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [complete, setComplete] = useState(false)
  const [busy, setBusy] = useState(false)

  function set(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function submit(event) {
    event.preventDefault()
    setErrors({})
    setFormError('')
    if (form.newPassword !== form.confirmNewPassword) {
      setErrors({ confirmNewPassword: 'New passwords do not match.' })
      return
    }

    setBusy(true)
    try {
      await api('/auth/reset-password', {
        method: 'POST',
        body: { token, ...form },
      })
      setComplete(true)
    } catch (error) {
      setErrors(error.fieldErrors || {})
      setFormError(error.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell
      title="Reset your password"
      intro="Choose a new password for your MaraMate account."
      footer={<>Return to <Link to="/login">log in</Link></>}
    >
      {formError && (
        <p className="banner banner-error" role="alert">
          {formError}
          {errors.token && <> <Link to="/forgot-password">Request another reset link</Link>.</>}
        </p>
      )}
      {complete ? (
        <p className="banner banner-ok" role="status">
          Your password has been reset. <Link to="/login">Log in with your new password</Link>.
        </p>
      ) : !token ? (
        <p className="banner banner-error" role="alert">
          This reset link is missing its token. Request a new link from the <Link to="/forgot-password">forgot password page</Link>.
        </p>
      ) : (
        <form onSubmit={submit} noValidate>
          <Field label="New password" name="newPassword" type="password" autoComplete="new-password"
            hint="Use 8 to 72 characters." value={form.newPassword} onChange={set} error={errors.newPassword} />
          <Field label="Confirm new password" name="confirmNewPassword" type="password" autoComplete="new-password"
            value={form.confirmNewPassword} onChange={set} error={errors.confirmNewPassword} />
          <button className="btn btn-ink btn-block" disabled={busy}>
            {busy ? 'Resetting…' : 'Reset password'}
          </button>
        </form>
      )}
    </AuthShell>
  )
}
