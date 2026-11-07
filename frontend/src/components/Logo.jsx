import { Link } from 'react-router-dom'

export default function Logo({ tone = 'light' }) {
  return (
    <Link to="/" className={`logo logo-${tone}`} aria-label="MaraMate home">
      <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true">
        <path d="M5 23V13a5 5 0 0 1 5-5h0a5 5 0 0 1 5 5v10z" fill="currentColor" />
        <path d="M17 25v-7a4 4 0 0 1 4-4h0a4 4 0 0 1 4 4v7z" fill="var(--mist)" />
      </svg>
      <span>MaraMate</span>
    </Link>
  )
}
