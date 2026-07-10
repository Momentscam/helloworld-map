import { useEffect, useRef, useState } from 'react'
import { useTour } from '../tour/store'
import { track } from '../lib/analytics'
import {
  REQUESTABLE_LOCATIONS,
  buildBottleRequest,
  customLocationId,
  isCustomLocation,
  isValidEmail,
  locationDisplayName,
  submitBottleRequest,
} from './bottleRequests'

type Step = 'select' | 'email' | 'done'

const STEP_NO: Record<Step, number> = { select: 1, email: 2, done: 3 }

export default function RequestBottleModal() {
  const open = useTour((s) => s.requestOpen)
  const { setRequestOpen } = useTour.getState()

  const [step, setStep] = useState<Step>('select')
  const [selected, setSelected] = useState<string[]>([])
  const [customText, setCustomText] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const panelRef = useRef<HTMLDivElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const restoreFocus = useRef<Element | null>(null)

  const close = (reason: string) => {
    track('request_bottle_closed', {
      step: STEP_NO[step],
      reason,
      locationIds: selected,
      selectedCount: selected.length,
    })
    setRequestOpen(false)
    if (step === 'done') {
      // fresh session next time after a completed request
      setStep('select')
      setSelected([])
      setCustomText('')
      setEmail('')
    }
    setError(null)
    ;(restoreFocus.current as HTMLElement | null)?.focus?.()
  }

  // focus management + Escape + a light Tab trap
  useEffect(() => {
    if (!open) return
    restoreFocus.current = document.activeElement
    panelRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        close('escape')
      }
      if (e.key === 'Tab' && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
        )
        if (focusables.length === 0) return
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, step, selected])

  useEffect(() => {
    if (open && step === 'email') emailRef.current?.focus()
  }, [open, step])

  if (!open) return null

  const toggle = (id: string) => {
    const isSelected = selected.includes(id)
    const next = isSelected ? selected.filter((x) => x !== id) : [...selected, id]
    setSelected(next)
    track('request_bottle_location_selected', {
      locationId: id,
      selected: !isSelected,
      selectedCount: next.length,
      step: 1,
    })
  }

  // "Select all" governs the fixed catalog; custom ideas are kept as-is
  const customSelected = selected.filter(isCustomLocation)
  const allSelected = REQUESTABLE_LOCATIONS.every((l) => selected.includes(l.id))
  const toggleAll = () => {
    const next = allSelected ? customSelected : [...REQUESTABLE_LOCATIONS.map((l) => l.id), ...customSelected]
    setSelected(next)
    track('request_bottle_location_selected', {
      locationId: 'all',
      selected: !allSelected,
      selectedCount: next.length,
      step: 1,
    })
  }

  const addCustom = () => {
    const text = customText.trim().slice(0, 60)
    if (!text) return
    const id = customLocationId(text)
    if (!selected.some((x) => x.toLowerCase() === id.toLowerCase())) {
      const next = [...selected, id]
      setSelected(next)
      track('request_bottle_location_selected', {
        locationId: id,
        selected: true,
        custom: true,
        selectedCount: next.length,
        step: 1,
      })
    }
    setCustomText('')
  }

  const goNext = () => {
    track('request_bottle_next_clicked', { locationIds: selected, selectedCount: selected.length })
    setError(null)
    setStep('email')
  }

  const submit = async () => {
    if (submitting) return
    if (!isValidEmail(email)) {
      setError('That doesn’t look like a valid email — mind checking it?')
      emailRef.current?.focus()
      return
    }
    if (selected.length === 0) {
      setError('Pick at least one place first.')
      setStep('select')
      return
    }
    setError(null)
    setSubmitting(true)
    const request = buildBottleRequest(email, selected)
    track('request_bottle_submitted', {
      locationIds: selected,
      selectedCount: selected.length,
      step: 2,
    })
    try {
      await submitBottleRequest(request)
      setStep('done')
      track('request_bottle_completed', { locationIds: selected, selectedCount: selected.length })
    } catch {
      setError('Something went wrong sending your request. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const nameOf = locationDisplayName

  return (
    <div className="rq-overlay" onPointerDown={(e) => e.target === e.currentTarget && close('overlay')}>
      <div
        ref={panelRef}
        className="rq-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rq-title"
        tabIndex={-1}
      >
        <button className="sc-close" onClick={() => close('close_button')} aria-label="Close">
          ✕
        </button>

        {step !== 'done' && (
          <div className="rq-steps">
            <span className={step === 'select' ? 'on' : ''}>01 SELECT PLACES</span>
            <i>—</i>
            <span className={step === 'email' ? 'on' : ''}>02 YOUR EMAIL</span>
          </div>
        )}

        {step === 'select' && (
          <div className="rq-step" key="select">
            <h2 className="rq-title" id="rq-title">
              Which bottle should we launch next?
            </h2>
            <p className="rq-sub">Select all the places where you would like to find a Hello World bottle.</p>

            <div className="rq-options" role="group" aria-label="Locations">
              {REQUESTABLE_LOCATIONS.map((loc, i) => {
                const on = selected.includes(loc.id)
                return (
                  <button
                    key={loc.id}
                    className={`rq-option${on ? ' on' : ''}`}
                    aria-pressed={on}
                    onClick={() => toggle(loc.id)}
                  >
                    <span className="rq-check" aria-hidden>
                      {on ? '✓' : ''}
                    </span>
                    <span className="rq-num">{String(i + 1).padStart(2, '0')}</span>
                    {loc.name}
                  </button>
                )
              })}
            </div>

            <div className="rq-custom">
              <p className="rq-custom-hint">
                Somewhere else in mind? We’re open to your craziest ideas — and it doesn’t have to
                be in Barcelona. Hello World bottles travel worldwide. 🌍
              </p>
              <div className="rq-custom-row">
                <input
                  className="rq-input"
                  type="text"
                  maxLength={60}
                  placeholder="Your dream spot — anywhere on Earth"
                  aria-label="Suggest another place"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCustom()}
                />
                <button className="rq-btn primary small" onClick={addCustom} disabled={!customText.trim()}>
                  + ADD
                </button>
              </div>
              {customSelected.length > 0 && (
                <div className="rq-tags" aria-label="Your suggested places">
                  {customSelected.map((id) => (
                    <span key={id} className="rq-tag">
                      {nameOf(id)}
                      <button
                        onClick={() => setSelected(selected.filter((x) => x !== id))}
                        aria-label={`Remove ${nameOf(id)}`}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="rq-meta">
              <span aria-live="polite">
                {selected.length === 0 ? 'None selected yet' : `${selected.length} selected`}
              </span>
              <button className="rq-link" onClick={toggleAll}>
                {allSelected ? 'Clear all' : 'Select all'}
              </button>
            </div>

            <div className="rq-actions">
              <button className="rq-btn ghost" onClick={() => close('cancel')}>
                CANCEL
              </button>
              <button className="rq-btn primary" disabled={selected.length === 0} onClick={goNext}>
                NEXT&nbsp;&nbsp;›
              </button>
            </div>
          </div>
        )}

        {step === 'email' && (
          <div className="rq-step" key="email">
            <h2 className="rq-title" id="rq-title">
              Be the first to know
            </h2>
            <p className="rq-sub">
              Enter your email and we’ll notify you when one of your requested bottles launches.
            </p>

            <div className="rq-tags" aria-label="Selected places">
              {selected.map((id) => (
                <span key={id} className="rq-tag">
                  {nameOf(id)}
                  <button
                    onClick={() => {
                      const next = selected.filter((x) => x !== id)
                      setSelected(next)
                      if (next.length === 0) setStep('select')
                    }}
                    aria-label={`Remove ${nameOf(id)}`}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>

            <label className="rq-label" htmlFor="rq-email">
              EMAIL
            </label>
            <input
              id="rq-email"
              ref={emailRef}
              className={`rq-input${error ? ' invalid' : ''}`}
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (error) setError(null)
              }}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
            />
            {error && (
              <p className="rq-error" role="alert">
                {error}
              </p>
            )}
            <p className="rq-privacy">We’ll only email you about new Hello World bottle launches. No spam.</p>

            <div className="rq-actions">
              <button className="rq-btn ghost" onClick={() => setStep('select')} disabled={submitting}>
                ‹&nbsp;&nbsp;BACK
              </button>
              <button className="rq-btn primary" onClick={submit} disabled={submitting}>
                {submitting ? 'SENDING…' : 'NOTIFY ME'}
              </button>
            </div>
          </div>
        )}

        {step === 'done' && (
          <div className="rq-step rq-done" key="done">
            <div className="rq-stamp" aria-hidden>
              <span>✓</span>
            </div>
            <h2 className="rq-title" id="rq-title">
              Request received
            </h2>
            <p className="rq-sub">We’ll let you know when new bottles launch at your selected locations.</p>
            <div className="rq-tags centered">
              {selected.map((id) => (
                <span key={id} className="rq-tag static">
                  {nameOf(id)}
                </span>
              ))}
            </div>
            <div className="rq-actions centered">
              <button className="rq-btn primary" onClick={() => close('back_to_atlas')}>
                BACK TO THE ATLAS
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
