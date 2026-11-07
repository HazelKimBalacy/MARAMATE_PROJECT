import { Link } from 'react-router-dom'
import Logo from '../components/Logo.jsx'
import SeatMap from '../components/SeatMap.jsx'
import Timeline from '../components/Timeline.jsx'
import '../styles/landing.css'

const FEATURES = [
  ['See every seat', 'A live seat map shows what is open, held for payment, or already booked, so no seat is sold twice.'],
  ['Book a private room', 'Bringing a group? Reserve a whole private room instead of picking seats one by one.'],
  ['Pay online', 'Pay through PayMongo. Reservations that are not paid within 30 minutes are released automatically.'],
  ['Get a text, not a reminder to remember', 'Receive an SMS when you are confirmed and another 24 hours before the first film.'],
  ['Walk in with a QR ticket', 'Each paid reservation gets a QR e-ticket. Staff scan it at the door.'],
]

export default function Landing() {
  return (
    <>
      <header className="nav">
        <div className="wrap nav-inner">
          <Logo />
          <nav className="nav-links" aria-label="Main">
            <a href="#features">Features</a>
            <a href="#lineup">Lineups</a>
            <Link to="/login">Log in</Link>
            <Link to="/signup" className="btn btn-cream btn-sm">Sign up</Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="wrap hero-grid">
            <div className="hero-copy">
              <h1>Your seat for the whole marathon.</h1>
              <p className="lead">
                Browse movie marathons, pick your seats on a live map, pay online, and walk in with a QR ticket.
              </p>
              <div className="hero-actions">
                <Link to="/signup" className="btn btn-cream">Create an account</Link>
                <Link to="/login" className="btn btn-ghost">Log in</Link>
              </div>
            </div>
            <SeatMap />
          </div>
        </section>

        <section className="section section-cream" id="features">
          <div className="wrap split">
            <div>
              <h2>Everything a marathon night needs, in one place.</h2>
              <p className="muted">
                For students, friends, couples, and families who join marathons, and for the small cinemas,
                screening rooms, and campus clubs that run them.
              </p>
            </div>
            <ul className="feature-list">
              {FEATURES.map(([title, text]) => (
                <li key={title}>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section section-haze" id="lineup">
          <div className="wrap">
            <h2 className="narrow">Know the whole night before you book.</h2>
            <p className="muted narrow">
              Every event page lists the films in order with start times, breaks, and the total running time.
              Here is a sample Studio Ghibli night.
            </p>
            <Timeline />
          </div>
        </section>

        <section className="section section-ink">
          <div className="wrap cta">
            <div>
              <h2>Running a marathon?</h2>
              <p className="lead-sm">
                Register as an organizer to set up venues, seat maps, and film lineups. An administrator
                approves new organizer accounts before you can publish events.
              </p>
            </div>
            <div className="cta-actions">
              <Link to="/signup?role=organizer" className="btn btn-cream">Register as an organizer</Link>
              <Link to="/signup" className="btn btn-ghost">Join as a moviegoer</Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="wrap footer-inner">
          <Logo />
          <p>
            Film information will come from TMDB. This product uses the TMDB API but is not endorsed or
            certified by TMDB.
          </p>
        </div>
      </footer>
    </>
  )
}
