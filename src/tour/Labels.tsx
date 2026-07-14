import { Html } from '@react-three/drei'
import { STOPS } from './stops'
import { useTour } from './store'

const MINOR: Array<{ name: string; at: [number, number, number] }> = [
  { name: 'SAGRADA FAMÍLIA', at: [99, 52, -55] },
  { name: 'LA PEDRERA', at: [11, 24, -77] },
  { name: 'PARC GÜELL', at: [20, 20, -185] },
  { name: 'CAMP NOU', at: [-210, 20, -35] },
  { name: 'RCDE STADIUM', at: [-300, 18, 60] },
  { name: "L'AQUÀRIUM", at: [28, 18, 140] },
]

export default function Labels() {
  const labelsOn = useTour((s) => s.labelsOn)
  const stopIndex = useTour((s) => s.stopIndex)
  const setStop = useTour((s) => s.setStop)
  if (!labelsOn) return null

  return (
    <group>
      {STOPS.slice(1).map((stop, i) => (
        <Html key={stop.id} position={stop.world} center zIndexRange={[40, 0]}>
          <button
            className={`pin-label${stopIndex === i + 1 ? ' active' : ''}`}
            onClick={() => setStop(i + 1)}
          >
            <span className="pin-num">{String(i + 1).padStart(2, '0')}</span>
            {stop.label}
          </button>
        </Html>
      ))}
      {MINOR.map((m) => (
        <Html key={m.name} position={m.at} center zIndexRange={[30, 0]}>
          <span className="pin-label mini">{m.name}</span>
        </Html>
      ))}
    </group>
  )
}
