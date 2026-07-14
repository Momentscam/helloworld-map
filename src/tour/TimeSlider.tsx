import type { ReactNode } from 'react'
import { useTour } from './store'

/* small drawn glyphs — stroke inherits currentColor so hover can tint them */
const G = ({ children }: { children: ReactNode }) => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
)

const PRESETS: Array<{ glyph: ReactNode; label: string; hour: number }> = [
  {
    label: 'Sunrise',
    hour: 7.4,
    glyph: (
      <G>
        <path d="M4 17h16M8 17a4 4 0 0 1 8 0" />
        <path d="M12 10V5m0 0-2 2m2-2 2 2" />
      </G>
    ),
  },
  {
    label: 'Day',
    hour: 13.5,
    glyph: (
      <G>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6l1.4 1.4m10 10 1.4 1.4m0-12.8-1.4 1.4m-10 10-1.4 1.4" />
      </G>
    ),
  },
  {
    label: 'Sunset',
    hour: 20.2,
    glyph: (
      <G>
        <path d="M4 17h16M8 17a4 4 0 0 1 8 0" />
        <path d="M12 5v5m0 0-2-2m2 2 2-2" />
      </G>
    ),
  },
  {
    label: 'Night',
    hour: 23.5,
    glyph: (
      <G>
        <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 7 7 0 1 0 20 14.5Z" />
      </G>
    ),
  },
]

const fmt = (t: number) => {
  const h = Math.floor(t)
  const m = Math.round((t - h) * 60)
  return `${String(h).padStart(2, '0')}:${String(m === 60 ? 0 : m).padStart(2, '0')}`
}

/** time-of-day control — follows the laptop clock until you scrub it.
    The track itself is the information: a night→dawn→day→dusk→night gradient. */
export default function TimeSlider() {
  const timeOfDay = useTour((s) => s.timeOfDay)
  const timeAuto = useTour((s) => s.timeAuto)
  const { setTimeOfDay, syncClock } = useTour.getState()
  const night = timeOfDay < 6.6 || timeOfDay > 21.2

  return (
    <div className="time-bar">
      {PRESETS.map((p) => (
        <button
          key={p.label}
          className="tb-preset"
          title={`${p.label} · ${fmt(p.hour)}`}
          aria-label={p.label}
          onClick={() => setTimeOfDay(p.hour)}
        >
          {p.glyph}
        </button>
      ))}
      <input
        type="range"
        min={0}
        max={24}
        step={0.1}
        value={timeOfDay}
        aria-label="Time of day"
        className={`tb-range${night ? ' night' : ''}`}
        onChange={(e) => setTimeOfDay(Number(e.target.value))}
      />
      <span className="tb-time">{fmt(timeOfDay)}</span>
      <button
        className={`tb-now${timeAuto ? ' active' : ''}`}
        onClick={syncClock}
        title="Follow your clock"
      >
        NOW
      </button>
    </div>
  )
}
