import { useState } from 'react'

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F']
const SEATS_PER_ROW = 10
const AISLE_AFTER = 5
const PRICE = 250
const MAX_SEATS = 10 // default reservation limit (FR-022)

// Fixed sample data so the hero always looks the same.
const BOOKED = new Set(['A3', 'A4', 'B7', 'C2', 'C3', 'C8', 'D9', 'D10', 'E5', 'E6', 'F1'])
const HELD = new Set(['B2', 'D4', 'F8'])

const stateOf = (id, picked) =>
  picked.has(id) ? 'yours' : BOOKED.has(id) ? 'booked' : HELD.has(id) ? 'held' : 'open'

const LABEL = { yours: 'selected', booked: 'booked', held: 'held for payment', open: 'available' }

export default function SeatMap() {
  const [picked, setPicked] = useState(() => new Set(['C5', 'C6']))

  function toggle(id) {
    setPicked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else if (next.size < MAX_SEATS) next.add(id)
      return next
    })
  }

  const list = [...picked].sort()

  return (
    <figure className="seatmap" aria-label="Sample seat map">
      <div className="screen" aria-hidden="true"><span>Screen</span></div>

      <div className="seat-grid" role="group" aria-label="Seats">
        {ROWS.map((row, r) => (
          <div className="seat-row" key={row} style={{ '--row': r }}>
            <span className="row-name" aria-hidden="true">{row}</span>
            {Array.from({ length: SEATS_PER_ROW }, (_, i) => {
              const id = `${row}${i + 1}`
              const state = stateOf(id, picked)
              const unavailable = state === 'booked' || state === 'held'
              return (
                <button
                  key={id}
                  type="button"
                  className={`seat seat-${state}${i + 1 === AISLE_AFTER ? ' seat-aisle' : ''}`}
                  disabled={unavailable}
                  aria-pressed={state === 'yours'}
                  aria-label={`Seat ${id}, ${LABEL[state]}`}
                  onClick={() => toggle(id)}
                />
              )
            })}
          </div>
        ))}
      </div>

      <ul className="seat-legend" aria-label="Legend">
        <li><i className="seat-key seat-open" />Available</li>
        <li><i className="seat-key seat-held" />Held</li>
        <li><i className="seat-key seat-booked" />Booked</li>
        <li><i className="seat-key seat-yours" />Yours</li>
      </ul>

      <figcaption className="seat-summary" aria-live="polite">
        {list.length === 0 ? (
          <span>Tap a seat to try it. This map is a sample.</span>
        ) : (
          <>
            <span>{list.join(', ')}</span>
            <strong>₱{(list.length * PRICE).toLocaleString()}</strong>
          </>
        )}
      </figcaption>
    </figure>
  )
}
