import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthShell from '../components/AuthShell.jsx'
import Field from '../components/Field.jsx'
import { api } from '../api.js'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [fieldError, setFieldError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setError('')
    setFieldError('')
    setMessage('')
    setBusy(true)
    try {
      const response = await api('/auth/forgot-password', {
        method: 'POST',
        body: { email: email.trim() },
      })
      setMessage(response.message)
    } catch (requestError) {
      setError(requestError.message)
      setFieldError(requestError.fieldErrors?.email || '')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell
      title="Forgot your password?"
      intro="Enter your account email. If it’s registered, we’ll email you a secure reset link—no code needed."
      footer={<>Remembered it? <Link to="/login">Back to log in</Link></>}
    >
      {error && <p className="banner banner-error" role="alert">{error}</p>}
      {message && <p className="banner banner-ok" role="status">{message}</p>}
      <form onSubmit={submit} noValidate>
        <Field label="Email" name="email" type="email" autoComplete="email"
          value={email} onChange={(event) => setEmail(event.target.value)} error={fieldError} />
        <button className="btn btn-ink btn-block" disabled={busy}>
          {busy ? 'Sending…' : 'Send reset link'}
        </button>
      </form>
    </AuthShell>
  )
}
