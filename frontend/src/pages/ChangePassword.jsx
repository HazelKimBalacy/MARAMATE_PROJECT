import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api.js'
import { useAuth } from '../auth.jsx'
import Field from '../components/Field.jsx'
import Logo from '../components/Logo.jsx'
import '../styles/auth.css'

export default function ChangePassword() {
  const { token, logout } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [notice, setNotice] = useState('')
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  function setPasswordField(event) {
    setPassword((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function changePassword(event) {
    event.preventDefault()
    setErrors({})
    setFormError('')
    setNotice('')
    setSaving(true)
    try {
      const response = await api('/auth/change-password', {
        method: 'POST',
        body: password,
        token,
      })
      setPassword({ currentPassword: '', newPassword: '', confirmNewPassword: '' })
      setNotice(response.message)
    } catch (error) {
      setErrors(error.fieldErrors || {})
      setFormError(error.message)
    } finally {
      setSaving(false)
    }
  }

  function signOut() {
    logout()
    navigate('/', { replace: true })
  }

  return (
    <div className="home">
      <header className="home-bar">
        <Logo />
        <div className="home-actions">
          <Link className="btn btn-ghost-ink btn-sm" to="/profile">Back to profile</Link>
          <button className="btn btn-ghost-ink btn-sm" type="button" onClick={signOut}>Log out</button>
        </div>
      </header>
      <main className="home-main">
        <section className="account-heading">
          <h1>Change password</h1>
          <p className="muted">This is for changing your password while signed in. Verify your current password first.</p>
        </section>
        <section className="account-card profile-card">
          {notice && <p className="banner banner-ok" role="status">{notice}</p>}
          {formError && <p className="banner banner-error" role="alert">{formError}</p>}
          <form onSubmit={changePassword} noValidate>
            <Field label="Current password" name="currentPassword" type="password" autoComplete="current-password"
              value={password.currentPassword} onChange={setPasswordField} error={errors.currentPassword} />
            <Field label="New password" name="newPassword" type="password" autoComplete="new-password"
              hint="Use 8 to 72 characters." value={password.newPassword} onChange={setPasswordField}
              error={errors.newPassword} />
            <Field label="Confirm new password" name="confirmNewPassword" type="password" autoComplete="new-password"
              value={password.confirmNewPassword} onChange={setPasswordField}
              error={errors.confirmNewPassword} />
            <button className="btn btn-ink btn-block" disabled={saving}>
              {saving ? 'Changing…' : 'Change password'}
            </button>
          </form>
          <p className="profile-password-link">
            Forgot your password? <Link to="/forgot-password">Reset it from the login page</Link>.
          </p>
        </section>
      </main>
    </div>
  )
}
