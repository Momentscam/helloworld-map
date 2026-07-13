import { create } from 'zustand'
import { STOPS, stopIndexById } from './stops'
import type { RideTarget } from './rideState'
import { track } from '../lib/analytics'

export type ViewMode = 'tour' | 'explore' | 'ride'

export type MoveKey = 'w' | 'a' | 's' | 'd' | 'boost'
export interface MoveState {
  w: boolean
  a: boolean
  s: boolean
  d: boolean
  boost: boolean
}

interface TourState {
  stopIndex: number
  mode: ViewMode
  labelsOn: boolean
  /** true while the camera is flying between stops (disables orbit) */
  flying: boolean
  /** WASD state — fed by keyboard and the on-screen pad, read by the camera rig */
  move: MoveState
  /** hour of day 0–24 driving the scene lighting */
  timeOfDay: number
  /** true while the scene clock follows the laptop clock */
  timeAuto: boolean
  /** "Request a New Bottle" dialog visibility */
  requestOpen: boolean
  /** which vehicle the ride camera follows while mode === 'ride' */
  rideTarget: RideTarget
  setStop: (i: number) => void
  next: () => void
  prev: () => void
  setMode: (m: ViewMode) => void
  toggleLabels: () => void
  setFlying: (f: boolean) => void
  setMoveKey: (k: MoveKey, down: boolean) => void
  clearMoveKeys: () => void
  setTimeOfDay: (h: number) => void
  syncClock: () => void
  setRequestOpen: (open: boolean) => void
  startRide: (target: RideTarget) => void
}

export const clockHour = () => {
  const d = new Date()
  return d.getHours() + d.getMinutes() / 60
}

function readUrl() {
  const p = new URLSearchParams(window.location.search)
  return {
    stopIndex: stopIndexById(p.get('stop')),
    mode: (p.get('view') === 'explore' ? 'explore' : 'tour') as ViewMode,
  }
}

const initial = readUrl()

export const useTour = create<TourState>((set, get) => ({
  stopIndex: initial.stopIndex,
  mode: initial.mode,
  labelsOn: true,
  flying: false,
  move: { w: false, a: false, s: false, d: false, boost: false },
  timeOfDay: clockHour(),
  timeAuto: true,
  requestOpen: false,
  rideTarget: 'tram',

  setStop: (i) => set({ stopIndex: (i + STOPS.length) % STOPS.length, mode: 'tour' }),
  next: () => get().setStop(get().stopIndex + 1),
  prev: () => get().setStop(get().stopIndex - 1),
  setMode: (mode) => set({ mode }),
  toggleLabels: () => set((s) => ({ labelsOn: !s.labelsOn })),
  setFlying: (flying) => set((s) => (s.flying === flying ? s : { flying })),
  setMoveKey: (k, down) =>
    set((s) => (s.move[k] === down ? s : { move: { ...s.move, [k]: down } })),
  clearMoveKeys: () =>
    set((s) =>
      s.move.w || s.move.a || s.move.s || s.move.d || s.move.boost
        ? { move: { w: false, a: false, s: false, d: false, boost: false } }
        : s,
    ),
  setTimeOfDay: (h) => set({ timeOfDay: ((h % 24) + 24) % 24, timeAuto: false }),
  syncClock: () => set({ timeOfDay: clockHour(), timeAuto: true }),
  setRequestOpen: (requestOpen) => set({ requestOpen }),
  startRide: (rideTarget) => set({ rideTarget, mode: 'ride' }),
}))

useTour.subscribe((s, prev) => {
  if (s.stopIndex !== prev.stopIndex || s.mode !== prev.mode) {
    const p = new URLSearchParams(window.location.search)
    p.set('stop', STOPS[s.stopIndex].id)
    if (s.mode === 'explore') p.set('view', 'explore')
    else p.delete('view')
    window.history.replaceState(null, '', `?${p.toString()}`)
  }
  // which landmarks people open, and which rides they take
  if (s.stopIndex !== prev.stopIndex && s.stopIndex > 0) {
    track('tour_stop_viewed', { stopId: STOPS[s.stopIndex].id, stopIndex: s.stopIndex })
  }
  if (s.mode === 'ride' && (prev.mode !== 'ride' || s.rideTarget !== prev.rideTarget)) {
    track('ride_started', { ride: s.rideTarget })
  }
})

if (import.meta.env.DEV) {
  ;(window as unknown as Record<string, unknown>).__tour = useTour
}
