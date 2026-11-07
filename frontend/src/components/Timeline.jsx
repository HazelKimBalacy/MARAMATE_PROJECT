// Sample marathon lineup. Start and end times are computed from runtimes and breaks (FR-018).
const START = 18 * 60 // 6:00 PM
const BREAK = 15

const FILMS = [
  { title: 'Spirited Away', runtime: 125 },
  { title: "Howl's Moving Castle", runtime: 119 },
  { title: "Kiki's Delivery Service", runtime: 103 },
]

const clock = (mins) => {
  const m = mins % (24 * 60)
  const h24 = Math.floor(m / 60)
  const h = h24 % 12 || 12
  return `${h}:${String(m % 60).padStart(2, '0')} ${h24 < 12 ? 'AM' : 'PM'}`
}

const duration = (mins) => `${Math.floor(mins / 60)}h ${mins % 60}m`

function build() {
  const blocks = []
  let t = START
  FILMS.forEach((f, i) => {
    blocks.push({ kind: 'film', ...f, start: t, end: t + f.runtime })
    t += f.runtime
    if (i < FILMS.length - 1) {
      blocks.push({ kind: 'break', title: 'Break', runtime: BREAK, start: t, end: t + BREAK })
      t += BREAK
    }
  })
  return { blocks, total: t - START, end: t }
}

export default function Timeline() {
  const { blocks, total, end } = build()

  return (
    <div className="timeline">
      <div className="timeline-bar" role="presentation">
        {blocks.map((b) => (
          <div key={b.start} className={`tl-block tl-${b.kind}`} style={{ flexGrow: b.runtime }} />
        ))}
      </div>

      <ol className="timeline-list">
        {blocks.map((b) => (
          <li key={b.start} className={`tl-item tl-item-${b.kind}`}>
            <time>{clock(b.start)}</time>
            <span className="tl-title">{b.title}</span>
            <span className="tl-len">{b.kind === 'film' ? duration(b.runtime) : `${b.runtime} min`}</span>
          </li>
        ))}
        <li className="tl-item tl-item-end">
          <time>{clock(end)}</time>
          <span className="tl-title">Lights up</span>
          <span className="tl-len" />
        </li>
      </ol>

      <p className="timeline-total">
        Total running time <strong>{duration(total)}</strong>, worked out for you from each film and break.
      </p>
    </div>
  )
}
