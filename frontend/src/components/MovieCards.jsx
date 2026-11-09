import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../auth.jsx'
import BookingFlow from './BookingFlow.jsx'

const MOVIES = [
  { id: 'avengers-doomsday', title: 'Avengers: Doomsday', runtime: '2h 45m', rating: 'PG-13', poster: '/posters/avengers-doomsday.avif' },
  { id: 'moana', title: 'Moana', runtime: '1h 55m', rating: 'PG', poster: '/posters/moana.jpg' },
  { id: 'street-fighter', title: 'Street Fighter', runtime: '2h', rating: 'PG-13', poster: '/posters/street-fighter.webp' },
  { id: 'michael', title: 'Michael', runtime: '2h 7m', rating: 'PG', poster: '/posters/michael.png' },
  { id: 'scary-movie', title: 'Scary Movie', runtime: '1h 15m', rating: 'R', poster: '/posters/scary-movie.jpg' },
  { id: 'mortal-kombat-ii', title: 'Mortal Kombat II', runtime: null, rating: null, poster: '/posters/mortal-kombat-ii.jpg' },
]

const SHOWTIMES = ['12:00 PM', '3:00 PM', '7:00 PM']

function today() {
  const date = new Date()
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return localDate.toISOString().slice(0, 10)
}

function makeContinueUrl(movie, date, time) {
  const params = new URLSearchParams({ movie, date, time })
  return `/?${params.toString()}`
}

export default function MovieCards() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedMovie = MOVIES.find(({ id }) => id === searchParams.get('movie'))
  const [date, setDate] = useState(searchParams.get('date') || today)
  const [time, setTime] = useState(searchParams.get('time') || '')
  const continueUrl = selectedMovie && date && time
    ? makeContinueUrl(selectedMovie.id, date, time)
    : ''

  function openMovie(movie) {
    setDate(today())
    setTime('')
    setSearchParams({ movie: movie.id })
  }

  function closeMovie() {
    setSearchParams({})
  }

  function selectTime(showtime) {
    setTime(showtime)
    if (selectedMovie) {
      setSearchParams({ movie: selectedMovie.id, date, time: showtime }, { replace: true })
    }
  }

  return (
    <>
      <ul className="movie-grid" aria-label="Movie events">
        {MOVIES.map((movie) => (
          <li key={movie.id}>
            <button className="movie-card" type="button" onClick={() => openMovie(movie)}>
              <img className="movie-poster" src={movie.poster} alt="" />
              <span className="movie-card-info">
                <span className="movie-card-title">{movie.title}</span>
                <span className="movie-card-meta">
                  {movie.runtime && movie.rating
                    ? `${movie.runtime} · Rated ${movie.rating}`
                    : 'Runtime and rating to be announced'}
                </span>
                <span className="movie-card-action">View details & showtimes</span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {selectedMovie && (
        <div className="movie-dialog-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeMovie()
        }}>
          <section className="movie-dialog" role="dialog" aria-modal="true" aria-labelledby="movie-dialog-title">
            <button className="movie-dialog-close" type="button" onClick={closeMovie} aria-label="Close movie details">×</button>
            <div className="movie-dialog-heading">
              <img src={selectedMovie.poster} alt="" />
              <div>
                <p className="movie-dialog-eyebrow">Movie details</p>
                <h2 id="movie-dialog-title">{selectedMovie.title}</h2>
                <p>{selectedMovie.runtime && selectedMovie.rating
                  ? `${selectedMovie.runtime} · Rated ${selectedMovie.rating}`
                  : 'Runtime and rating to be announced'}</p>
              </div>
            </div>

            <div className="screening-picker">
              <label htmlFor="screening-date">Choose a screening date</label>
              <input
                id="screening-date"
                type="date"
                min={today()}
                required
                value={date}
                onChange={(event) => {
                  setDate(event.target.value)
                  setTime('')
                  setSearchParams({ movie: selectedMovie.id })
                }}
              />
              <fieldset className="showtime-picker">
                <legend>Sample showtime slots</legend>
                <div>
                  {SHOWTIMES.map((showtime) => (
                    <button
                      className={`showtime-option${time === showtime ? ' selected' : ''}`}
                      type="button"
                      key={showtime}
                      aria-pressed={time === showtime}
                      disabled={!date}
                      onClick={() => selectTime(showtime)}
                    >
                      {showtime}
                    </button>
                  ))}
                </div>
              </fieldset>
              <p className="schedule-note">Final movie and time availability will depend on the organizer’s published schedule.</p>
            </div>

            {time && (
              user ? (
                <BookingFlow
                  key={`${selectedMovie.id}-${date}-${time}`}
                  movie={selectedMovie}
                  date={date}
                  time={time}
                  onChangeScreening={() => {
                    setTime('')
                    setSearchParams({ movie: selectedMovie.id, date })
                  }}
                  onClose={closeMovie}
                />
              ) : (
                <div className="reservation-login">
                  <p>Log in or create an account to continue with this screening.</p>
                  <div>
                    <Link className="btn btn-ink" to={`/login?continue=${encodeURIComponent(continueUrl)}`}>Log in</Link>
                    <Link className="btn btn-ghost-ink" to={`/signup?continue=${encodeURIComponent(continueUrl)}`}>Sign up</Link>
                  </div>
                </div>
              )
            )}
          </section>
        </div>
      )}
    </>
  )
}
