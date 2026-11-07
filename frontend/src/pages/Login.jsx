import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthShell from '../components/AuthShell.jsx'
import Field from '../components/Field.jsx'
import { useAuth } from '../auth.jsx'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const notice = useLocation().state?.notice

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  async function submit(e) {
    e.preventDefault()
    const next = {}
    if (!form.email.trim()) next.email = 'Enter your email address.'
    if (!form.password) next.password = 'Enter your password.'
    setErrors(next)
    setFormError('')
    if (Object.keys(next).length) return

    setBusy(true)
    try {
      await login(form.email.trim(), form.password)
      navigate('/home', { replace: true })
    } catch (err) {
      setErrors(err.fieldErrors || {})
      setFormError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      intro="Log in to reserve seats and see your tickets."
      footer={<>New to MaraMate? <Link to="/signup">Create an account</Link></>}
    >
      {notice && <p className="banner banner-ok" role="status">{notice}</p>}
      {formError && <p className="banner banner-error" role="alert">{formError}</p>}

      <form onSubmit={submit} noValidate>
        <Field label="Email" name="email" type="email" autoComplete="email"
          value={form.email} onChange={set} error={errors.email} />
        <Field label="Password" name="password" type="password" autoComplete="current-password"
          value={form.password} onChange={set} error={errors.password} />
        <button className="btn btn-ink btn-block" disabled={busy}>
          {busy ? 'Logging in…' : 'Log in'}
        </button>
      </form>
    </AuthShell>
  )
}
