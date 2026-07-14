import { useEffect } from 'react'
import Scene from './tour/Scene'
import MovePad from './tour/MovePad'
import TimeSlider from './tour/TimeSlider'
import RequestBottleModal from './request/RequestBottleModal'
import BottleCarousel from './tour/BottleCarousel'
import { track } from './lib/analytics'
import { STOPS } from './tour/stops'
import { useTour, type MoveKey } from './tour/store'

const WASD = new Set(['w', 'a', 's', 'd'])

/* small drawn glyphs for the ride cluster — stroke follows the button colour */
const rideSvg = (paths: React.ReactNode) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {paths}
  </svg>
)

const RIDE_GLYPHS = {
  tram: rideSvg(
    <>
      <path d="M9 2.5h6M12 2.5V5" />
      <rect x="6" y="5" width="12" height="13" rx="2.5" />
      <path d="M6 13.5h12M9.5 21h.01M14.5 21h.01" />
    </>,
  ),
  plane: rideSvg(
    <path d="M12 3v7.5M12 10.5 3.5 14v1.8l8.5-2.3 8.5 2.3V14L12 10.5M12 13.5v4l-3 2.2V21l3-1 3 1v-1.3l-3-2.2" />,
  ),
  teleferic: rideSvg(
    <>
      <path d="M2 4.5 22 2.5M12 3.5V7" />
      <rect x="7.5" y="7" width="9" height="11" rx="2" />
      <path d="M7.5 11.5h9" />
    </>,
  ),
}

export default function App() {
  const stopIndex = useTour((s) => s.stopIndex)
  const mode = useTour((s) => s.mode)
  const rideTarget = useTour((s) => s.rideTarget)
  const { setStop, next, prev, setMode } = useTour.getState()

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // the request dialog owns the keyboard while open; typing must never steer the camera
      if (useTour.getState().requestOpen) return
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'Escape') setStop(0)
      const k = e.key.toLowerCase()
      if (WASD.has(k) && !e.repeat) {
        const st = useTour.getState()
        if (st.mode !== 'explore') st.setMode('explore')
        st.setMoveKey(k as MoveKey, true)
      }
      if (e.key === 'Shift') useTour.getState().setMoveKey('boost', true)
    }
    const onKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase()
      if (WASD.has(k)) useTour.getState().setMoveKey(k as MoveKey, false)
      if (e.key === 'Shift') useTour.getState().setMoveKey('boost', false)
    }
    const onBlur = () => useTour.getState().clearMoveKeys()
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
    }
  }, [next, prev, setStop])

  // keep the scene clock in step with the laptop clock until the user scrubs
  useEffect(() => {
    const id = window.setInterval(() => {
      if (useTour.getState().timeAuto) useTour.getState().syncClock()
    }, 60_000)
    return () => window.clearInterval(id)
  }, [])

  const stop = STOPS[stopIndex]
  const showCard = stopIndex > 0

  return (
    <div className="atlas">
      <Scene />

      <a
        className="brand-chip"
        href="https://www.drinkhelloworld.com/"
        target="_blank"
        rel="noopener noreferrer"
        title="drinkhelloworld.com"
      >
        <img className="brand-logo" src="/images/brand/hello-world-logo.png" alt="Hello World" />
        HELLO WORLD <span className="brand-dot">·</span> ATLAS
      </a>

      <TimeSlider />

      <nav className="tour-index" aria-label="Tour stops">
        <div className="ti-head">✦&nbsp;&nbsp;THE TOUR</div>
        <button className={`ti-item${stopIndex === 0 ? ' active' : ''}`} onClick={() => setStop(0)}>
          <span>00</span> THE WHOLE BOARD <i>›</i>
        </button>
        {STOPS.slice(1).map((s, i) => (
          <button
            key={s.id}
            className={`ti-item${stopIndex === i + 1 ? ' active' : ''}`}
            onClick={() => setStop(i + 1)}
          >
            <span>{String(i + 1).padStart(2, '0')}</span> {s.label} <i>›</i>
          </button>
        ))}
        <button className="ti-start" onClick={() => (showCard ? next() : setStop(1))}>
          {showCard ? <>NEXT STOP&nbsp;&nbsp;›</> : <>▶&nbsp;&nbsp;START THE TOUR</>}
        </button>
        <button
          className="ti-request"
          onClick={() => {
            useTour.getState().setRequestOpen(true)
            track('request_bottle_opened', { from: 'tour_index' })
          }}
        >
          <span>+</span> REQUEST A NEW BOTTLE
        </button>
      </nav>

      <div className="hud">
        <div className="hud-head">RIDES</div>
        <div className="hud-row">
          {(
            [
              ['tram', 'TRAM', RIDE_GLYPHS.tram],
              ['plane', 'TIBIDABO PLANE', RIDE_GLYPHS.plane],
              ['teleferic', 'TELEFÈRIC', RIDE_GLYPHS.teleferic],
            ] as const
          ).map(([target, label, glyph]) => {
            const riding = mode === 'ride' && rideTarget === target
            return (
              <button
                key={target}
                className={`hud-btn ride${riding ? ' riding' : ''}`}
                title={riding ? 'Stop riding' : `Ride the ${label.toLowerCase()}`}
                onClick={() => (riding ? setMode('tour') : useTour.getState().startRide(target))}
              >
                {glyph}
                <strong className="on">{riding ? 'STOP' : label}</strong>
              </button>
            )
          })}
        </div>
      </div>

      <aside className={`stop-card${showCard ? ' open' : ''}`} aria-hidden={!showCard}>
        {showCard && (
          <>
            <div className="sc-spine" aria-hidden="true">
              HELLO WORLD&nbsp;&nbsp;·&nbsp;&nbsp;STOP {String(stopIndex).padStart(2, '0')}
              &nbsp;&nbsp;·&nbsp;&nbsp;{stop.label}&nbsp;&nbsp;·&nbsp;&nbsp;BARCELONA
            </div>
            <button className="sc-close" onClick={() => setStop(0)} aria-label="Back to overview">
              ✕
            </button>
            <div className="sc-kicker">
              STOP {String(stopIndex).padStart(2, '0')} / {String(STOPS.length - 1).padStart(2, '0')}
            </div>
            <h2 className="sc-title">{stop.name}</h2>
            <div className="sc-body">
              <div className="sc-media">
                <img className="sc-photo" src={stop.photo} alt={stop.name} loading="lazy" />
                <p className="sc-desc">{stop.description}</p>
              </div>
              {stop.contact && (
                <a className="sc-contact" href={stop.contact.href}>
                  ✉&nbsp;&nbsp;{stop.contact.label}
                </a>
              )}
              <BottleCarousel key={stop.id} bottles={stop.bottles} />
            </div>
            <div className="sc-nav">
              <button onClick={prev}>‹&nbsp;&nbsp;PREV</button>
              <span>
                {String(stopIndex).padStart(2, '0')}&nbsp;·&nbsp;{stop.label}
              </span>
              <button onClick={next}>NEXT&nbsp;&nbsp;›</button>
            </div>
          </>
        )}
      </aside>

      {!showCard && (
        <div className="start-hint">
          <button onClick={() => setStop(1)}>▶&nbsp;&nbsp;START THE TOUR</button>
          <button
            className="start-request"
            onClick={() => {
              useTour.getState().setRequestOpen(true)
              track('request_bottle_opened', { from: 'mobile_cta' })
            }}
          >
            + REQUEST A NEW BOTTLE
          </button>
        </div>
      )}

      <MovePad shifted={showCard} />

      <RequestBottleModal />

      <p className={`tagline${showCard ? ' shifted' : ''}`}>
        A live atlas of sustainable hydration in Barcelona&nbsp;—&nbsp;by{' '}
        <a href="https://www.drinkhelloworld.com/" target="_blank" rel="noopener noreferrer">
          Hello World
        </a>
      </p>
    </div>
  )
}
