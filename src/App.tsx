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
        {(
          [
            ['tram', '#06', 'RIDE THE TRAM'],
            ['plane', '#07', 'RIDE THE TIBIDABO PLANE'],
            ['teleferic', '#08', 'RIDE THE TELEFÈRIC'],
          ] as const
        ).map(([target, num, label]) => {
          const riding = mode === 'ride' && rideTarget === target
          return (
            <button
              key={target}
              className={`hud-btn ride${riding ? ' riding' : ''}`}
              onClick={() => (riding ? setMode('tour') : useTour.getState().startRide(target))}
            >
              <em>{num}</em>
              <strong className="on">{riding ? 'STOP RIDING' : label}</strong>
            </button>
          )
        })}
      </div>

      <aside className={`stop-card${showCard ? ' open' : ''}`} aria-hidden={!showCard}>
        {showCard && (
          <>
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
