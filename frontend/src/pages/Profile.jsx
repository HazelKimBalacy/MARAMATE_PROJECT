import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api.js'
import { useAuth } from '../auth.jsx'
import Field from '../components/Field.jsx'
import Logo from '../components/Logo.jsx'
import '../styles/auth.css'

export default function Profile() {
  const { token, user, updateUser, logout } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState({
    fullName: user.fullName,
    email: user.email,
    mobileNumber: user.mobileNumber,
  })
  const [profileErrors, setProfileErrors] = useState({})
  const [profileNotice, setProfileNotice] = useState('')
  const [profileError, setProfileError] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)

  function setProfileField(event) {
    setProfile((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  async function saveProfile(event) {
    event.preventDefault()
    setProfileErrors({})
    setProfileError('')
    setProfileNotice('')
    setSavingProfile(true)
    try {
      const updated = await api('/auth/me', { method: 'PUT', body: profile, token })
      updateUser(updated)
      setProfileNotice('Your profile was updated.')
    } catch (error) {
      setProfileErrors(error.fieldErrors || {})
      setProfileError(error.message)
    } finally {
      setSavingProfile(false)
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
          <Link className="btn btn-ghost-ink btn-sm" to="/">Browse movies</Link>
          <Link className="btn btn-ghost-ink btn-sm" to="/change-password">Change password</Link>
          <button className="btn btn-ghost-ink btn-sm" type="button" onClick={signOut}>Log out</button>
        </div>
      </header>
      <main className="home-main">
        <section className="account-heading">
          <h1>Hi, {user.fullName.split(' ')[0]}.</h1>
          <p className="muted">Manage your profile information.</p>
        </section>

        <section className="account-card profile-card">
          <h2>Your profile</h2>
          <p className="muted">Update the name, email, and mobile number on your account.</p>
          {profileNotice && <p className="banner banner-ok" role="status">{profileNotice}</p>}
          {profileError && <p className="banner banner-error" role="alert">{profileError}</p>}
          <form onSubmit={saveProfile} noValidate>
            <Field label="Full name" name="fullName" autoComplete="name"
              value={profile.fullName} onChange={setProfileField} error={profileErrors.fullName} />
            <Field label="Email" name="email" type="email" autoComplete="email"
              value={profile.email} onChange={setProfileField} error={profileErrors.email} />
            <Field label="Mobile number" name="mobileNumber" type="tel" autoComplete="tel"
              placeholder="09171234567" value={profile.mobileNumber} onChange={setProfileField}
              error={profileErrors.mobileNumber} />
            <button className="btn btn-ink btn-block" disabled={savingProfile}>
              {savingProfile ? 'Saving…' : 'Save profile'}
            </button>
          </form>
        </section>
      </main>
    </div>
  )
}
