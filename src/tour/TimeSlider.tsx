import { useTour } from './store'

const PRESETS: Array<{ icon: string; label: string; hour: number }> = [
  { icon: '🌅', label: 'Sunrise', hour: 7.4 },
  { icon: '☀️', label: 'Day', hour: 13.5 },
  { icon: '🌇', label: 'Sunset', hour: 20.2 },
  { icon: '🌙', label: 'Night', hour: 23.5 },
]

const fmt = (t: number) => {
  const h = Math.floor(t)
  const m = Math.round((t - h) * 60)
  return `${String(h).padStart(2, '0')}:${String(m === 60 ? 0 : m).padStart(2, '0')}`
}

/** time-of-day control — follows the laptop clock until you scrub it */
export default function TimeSlider() {
  const timeOfDay = useTour((s) => s.timeOfDay)
  const timeAuto = useTour((s) => s.timeAuto)
  const { setTimeOfDay, syncClock } = useTour.getState()

  return (
    <div className="time-bar">
      {PRESETS.map((p) => (
        <button
          key={p.label}
          className="tb-preset"
          title={`${p.label} · ${fmt(p.hour)}`}
          onClick={() => setTimeOfDay(p.hour)}
        >
          {p.icon}
        </button>
      ))}
      <input
        type="range"
        min={0}
        max={24}
        step={0.1}
        value={timeOfDay}
        aria-label="Time of day"
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
