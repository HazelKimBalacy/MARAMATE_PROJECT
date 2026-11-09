import { useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import AuthShell from '../components/AuthShell.jsx'
import Field from '../components/Field.jsx'
import { api } from '../api.js'

const MOBILE = /^(09|\+639)\d{9}$/
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(f) {
  const e = {}
  if (!f.fullName.trim()) e.fullName = 'Enter your full name.'
  if (!f.email.trim()) e.email = 'Enter your email address.'
  else if (!EMAIL.test(f.email.trim())) e.email = 'Enter a valid email address, like name@example.com.'
  if (!f.mobileNumber.trim()) e.mobileNumber = 'Enter your mobile number.'
  else if (!MOBILE.test(f.mobileNumber.trim())) e.mobileNumber = 'Use a Philippine mobile number, like 09171234567.'
  if (f.password.length < 8) e.password = 'Password must be at least 8 characters.'
  if (f.confirm !== f.password) e.confirm = 'Passwords do not match.'
  return e
}

export default function Signup() {
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()
  const continuation = params.get('continue')
  const continueQuery = continuation?.startsWith('/?movie=') && !continuation.startsWith('//')
    ? `?${new URLSearchParams({ continue: continuation })}`
    : ''

  const [form, setForm] = useState({
    role: params.get('role') === 'organizer' ? 'ORGANIZER' : 'MOVIEGOER',
    fullName: '', email: '', mobileNumber: '', password: '', confirm: '',
  })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    const found = validate(form)
    setErrors(found)
    setFormError('')
    if (Object.keys(found).length) return

    setBusy(true)
    try {
      const body = { ...form }
      delete body.confirm
      const user = await api('/auth/register', { method: 'POST', body })
      navigate(`/login${continueQuery}`, {
        replace: true,
        state: {
          notice: user.status === 'PENDING'
            ? 'Account created. An administrator needs to approve your organizer account before you can log in.'
            : 'Account created. Log in to continue.',
        },
      })
    } catch (err) {
      setErrors(err.fieldErrors || {})
      setFormError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell
      title="Create your account"
      intro="It takes a minute. You only need a name, email, and mobile number."
      footer={<>Already have an account? <Link to={`/login${location.search}`}>Log in</Link></>}
    >
      {formError && <p className="banner banner-error" role="alert">{formError}</p>}

      <form onSubmit={submit} noValidate>
        <fieldset className="role-pick">
          <legend>I want to</legend>
          <label className={form.role === 'MOVIEGOER' ? 'on' : ''}>
            <input type="radio" name="role" value="MOVIEGOER" checked={form.role === 'MOVIEGOER'} onChange={set} />
            Join marathons
          </label>
          <label className={form.role === 'ORGANIZER' ? 'on' : ''}>
            <input type="radio" name="role" value="ORGANIZER" checked={form.role === 'ORGANIZER'} onChange={set} />
            Host marathons
          </label>
        </fieldset>
        {form.role === 'ORGANIZER' && (
          <p className="field-hint role-note">Organizer accounts are reviewed by an administrator before you can log in.</p>
        )}

        <Field label="Full name" name="fullName" autoComplete="name"
          value={form.fullName} onChange={set} error={errors.fullName} />
        <Field label="Email" name="email" type="email" autoComplete="email"
          value={form.email} onChange={set} error={errors.email} />
        <Field label="Mobile number" name="mobileNumber" type="tel" inputMode="numeric" autoComplete="tel"
          placeholder="09171234567" hint="We send booking confirmations and reminders by SMS."
          value={form.mobileNumber} onChange={set} error={errors.mobileNumber} />
        <Field label="Password" name="password" type="password" autoComplete="new-password"
          hint="At least 8 characters." value={form.password} onChange={set} error={errors.password} />
        <Field label="Confirm password" name="confirm" type="password" autoComplete="new-password"
          value={form.confirm} onChange={set} error={errors.confirm} />

        <button className="btn btn-ink btn-block" disabled={busy}>
          {busy ? 'Creating account…' : 'Create account'}
        </button>
        <p className="privacy">
          We collect only your name, email, and mobile number, as described under the Data Privacy Act of 2012 (RA 10173).
        </p>
      </form>
    </AuthShell>
  )
}
