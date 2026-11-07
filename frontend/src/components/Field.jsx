import { useState } from 'react'

export default function Field({ label, name, error, hint, type = 'text', ...rest }) {
  const [shown, setShown] = useState(false)
  const isPassword = type === 'password'
  const describedBy = [error && `${name}-err`, hint && `${name}-hint`].filter(Boolean).join(' ') || undefined

  return (
    <div className={`field${error ? ' field-invalid' : ''}`}>
      <label htmlFor={name}>{label}</label>
      <div className="field-control">
        <input
          id={name}
          name={name}
          type={isPassword && shown ? 'text' : type}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          {...rest}
        />
        {isPassword && (
          <button type="button" className="reveal" onClick={() => setShown((s) => !s)} aria-pressed={shown}>
            {shown ? 'Hide' : 'Show'}
          </button>
        )}
      </div>
      {hint && !error && <p className="field-hint" id={`${name}-hint`}>{hint}</p>}
      {error && <p className="field-error" id={`${name}-err`}>{error}</p>}
    </div>
  )
}
