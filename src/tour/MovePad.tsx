import { useTour, type MoveKey } from './store'

const KEYS: Array<{ k: Exclude<MoveKey, 'boost'>; label: string; hint: string }> = [
  { k: 'w', label: 'W', hint: 'forward' },
  { k: 'a', label: 'A', hint: 'left' },
  { k: 's', label: 's', hint: 'back' },
  { k: 'd', label: 'D', hint: 'right' },
]

/** on-screen WASD pad — pressable with mouse/touch, mirrors the keyboard */
export default function MovePad({ shifted }: { shifted: boolean }) {
  const move = useTour((s) => s.move)
  const { setMoveKey, setMode, clearMoveKeys } = useTour.getState()

  const press = (k: MoveKey) => {
    if (useTour.getState().mode !== 'explore') setMode('explore')
    setMoveKey(k, true)
  }
  const release = (k: MoveKey) => setMoveKey(k, false)

  const cap = (k: Exclude<MoveKey, 'boost'>, label: string) => (
    <button
      key={k}
      className={`keycap${move[k] ? ' down' : ''}`}
      onPointerDown={(e) => {
        e.preventDefault()
        ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
        press(k)
      }}
      onPointerUp={() => release(k)}
      onPointerCancel={() => release(k)}
      onLostPointerCapture={() => release(k)}
      onContextMenu={(e) => e.preventDefault()}
      aria-label={`move ${KEYS.find((x) => x.k === k)?.hint}`}
    >
      {label}
    </button>
  )

  return (
    <div className={`move-pad${shifted ? ' shifted' : ''}`} onPointerLeave={() => clearMoveKeys()}>
      <div className="move-pad-title">MOVE THROUGH BARCELONA</div>
      <div className="keys">
        <span />
        {cap('w', 'W')}
        <span />
        {cap('a', 'A')}
        {cap('s', 'S')}
        {cap('d', 'D')}
      </div>
      <div className="move-pad-legend">
        <span><i>SHIFT</i> sprint</span>
        <span><i>DRAG</i> look</span>
        <span><i>SCROLL</i> zoom</span>
      </div>
      <div className="move-pad-legend">
        <span><i>←/→</i> stops</span>
        <span><i>ESC</i> overview</span>
      </div>
    </div>
  )
}
