import { useState } from 'react'

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F']
const SEATS_PER_ROW = 10
const PRICE_PER_SEAT = 250
const MAX_SEATS = 10
const BOOKED = new Set(['A3', 'A4', 'B7', 'C2', 'C3', 'C8', 'D9', 'D10', 'E5', 'E6', 'F1'])
const HELD = new Set(['B2', 'D4', 'F8'])
const METHODS = ['GCash', 'Maya', 'Card']

const money = (amount) => `₱${amount.toLocaleString('en-PH')}`

export default function BookingFlow({ movie, date, time, onChangeScreening, onClose }) {
  const [seats, setSeats] = useState([])
  const [method, setMethod] = useState(METHODS[0])
  const [step, setStep] = useState('seats')

  function toggleSeat(id) {
    setSeats((current) => current.includes(id)
      ? current.filter((seat) => seat !== id)
      : current.length < MAX_SEATS ? [...current, id] : current)
  }

  const total = seats.length * PRICE_PER_SEAT

  if (step === 'confirmed') {
    return (
      <section className="booking-panel" aria-live="polite">
        <p className="demo-label">Demo checkout only</p>
        <h3>Demo booking complete!</h3>
        <p>No payment was charged, and these seats are not actually reserved.</p>
        <dl className="booking-summary">
          <div><dt>Movie</dt><dd>{movie.title}</dd></div>
          <div><dt>Screening</dt><dd>{date} at {time}</dd></div>
          <div><dt>Seats</dt><dd>{seats.join(', ')}</dd></div>
          <div><dt>Demo payment</dt><dd>{method} · {money(total)}</dd></div>
        </dl>
        <button className="btn btn-ink btn-block" type="button" onClick={onClose}>Done</button>
      </section>
    )
  }

  if (step === 'checkout') {
    return (
      <section className="booking-panel">
        <button className="booking-back" type="button" onClick={() => setStep('seats')}>← Back to seats</button>
        <p className="demo-label">Demo checkout · No real payment</p>
        <h3>Review and pay</h3>
        <dl className="booking-summary">
          <div><dt>Movie</dt><dd>{movie.title}</dd></div>
          <div><dt>Screening</dt><dd>{date} at {time}</dd></div>
          <div><dt>Seats</dt><dd>{seats.join(', ')}</dd></div>
          <div><dt>Sample ticket price</dt><dd>{money(PRICE_PER_SEAT)} × {seats.length}</dd></div>
          <div className="booking-total"><dt>Total</dt><dd>{money(total)}</dd></div>
        </dl>
        <fieldset className="payment-methods">
          <legend>Choose a demo payment method</legend>
          {METHODS.map((option) => (
            <label className={method === option ? 'selected' : ''} key={option}>
              <input
                type="radio"
                name="payment-method"
                value={option}
                checked={method === option}
                onChange={() => setMethod(option)}
              />
              {option}
            </label>
          ))}
        </fieldset>
        <p className="payment-disclaimer">
          This is a visual demo. Do not enter payment details. No money will be collected.
        </p>
        <button className="btn btn-ink btn-block" type="button" onClick={() => setStep('confirmed')}>
          Simulate payment · {money(total)}
        </button>
      </section>
    )
  }

  return (
    <section className="booking-panel">
      <div className="booking-panel-heading">
        <div>
          <p className="demo-label">Sample seat availability</p>
          <h3>Choose your seats</h3>
          <p>{movie.title} · {date} · {time}</p>
        </div>
        <button className="booking-back" type="button" onClick={onChangeScreening}>Change screening</button>
      </div>

      <div className="booking-seatmap" aria-label="Sample seat map">
        <div className="screen" aria-hidden="true"><span>Screen</span></div>
        <div className="seat-grid" role="group" aria-label="Choose up to 10 seats">
          {ROWS.map((row, rowIndex) => (
            <div className="seat-row" key={row} style={{ '--row': rowIndex }}>
              <span className="row-name" aria-hidden="true">{row}</span>
              {Array.from({ length: SEATS_PER_ROW }, (_, index) => {
                const id = `${row}${index + 1}`
                const state = BOOKED.has(id) ? 'booked' : HELD.has(id) ? 'held' : seats.includes(id) ? 'yours' : 'open'
                const unavailable = state === 'booked' || state === 'held'
                return (
                  <button
                    key={id}
                    type="button"
                    className={`seat seat-${state}${index + 1 === 5 ? ' seat-aisle' : ''}`}
                    disabled={unavailable}
                    aria-pressed={state === 'yours'}
                    aria-label={`Seat ${id}, ${unavailable ? state === 'booked' ? 'booked' : 'held' : state === 'yours' ? 'selected' : 'available'}`}
                    onClick={() => toggleSeat(id)}
                  />
                )
              })}
            </div>
          ))}
        </div>
        <ul className="seat-legend" aria-label="Seat legend">
          <li><i className="seat-key seat-open" />Available</li>
          <li><i className="seat-key seat-held" />Held</li>
          <li><i className="seat-key seat-booked" />Booked</li>
          <li><i className="seat-key seat-yours" />Selected</li>
        </ul>
        <p className="booking-seat-total" aria-live="polite">
          {seats.length
            ? `${seats.length} seat${seats.length === 1 ? '' : 's'} selected · ${money(total)}`
            : 'Select at least one available seat'}
        </p>
      </div>
      {seats.length === MAX_SEATS && <p className="schedule-note">You can select up to {MAX_SEATS} seats per booking.</p>}
      <p className="payment-disclaimer">Sample ticket price: {money(PRICE_PER_SEAT)} per seat. Sample seat data only; seats are not held.</p>
      <button className="btn btn-ink btn-block" type="button" disabled={!seats.length} onClick={() => setStep('checkout')}>
        Continue to payment
      </button>
    </section>
  )
}
