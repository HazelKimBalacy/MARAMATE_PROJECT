import Logo from './Logo.jsx'
import '../styles/auth.css'

// Shared frame for login and signup: ink panel on the left, form on the right.
export default function AuthShell({ title, intro, children, footer }) {
  return (
    <div className="auth">
      <aside className="auth-side">
        <Logo />
        <div className="auth-pitch">
          <p className="auth-quote">Pick the seat. Pay once. Stay for every film.</p>
          <div className="auth-seats" aria-hidden="true">
            {Array.from({ length: 18 }, (_, i) => (
              <i key={i} className={[3, 4, 11, 16].includes(i) ? 'taken' : [7, 8].includes(i) ? 'mine' : ''} />
            ))}
          </div>
        </div>
      </aside>

      <main className="auth-main">
        <div className="auth-card">
          <h1>{title}</h1>
          <p className="muted">{intro}</p>
          {children}
          <p className="auth-footer">{footer}</p>
        </div>
      </main>
    </div>
  )
}
