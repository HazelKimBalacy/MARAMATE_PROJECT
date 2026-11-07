import Logo from '../components/Logo.jsx'
import { useAuth } from '../auth.jsx'
import '../styles/auth.css'

const ROLE = { MOVIEGOER: 'Moviegoer', ORGANIZER: 'Organizer', CHECKIN_STAFF: 'Check-in staff', ADMIN: 'Administrator' }

// Placeholder landing spot after login. Real dashboards come later.
// Logging out clears the session and RequireAuth sends the user back to /login.
export default function Home() {
  const { user, logout } = useAuth()

  return (
    <div className="home">
      <header className="home-bar">
        <Logo />
        <button className="btn btn-ghost-ink btn-sm" onClick={logout}>
          Log out
        </button>
      </header>
      <main className="home-main">
        <h1>Hi, {user.fullName.split(' ')[0]}.</h1>
        <p className="muted">You are logged in as {ROLE[user.role] || user.role}.</p>
        <p className="muted">Marathon events will show up here once they are added to MaraMate.</p>
      </main>
    </div>
  )
}
