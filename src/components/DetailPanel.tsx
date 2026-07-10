import { useMemo } from 'react'
import { useAtlas } from '../store'
import type { Bottle, Machine } from '../types'
import RarityBadge from './RarityBadge'

export default function DetailPanel() {
  const machines = useAtlas((s) => s.machines)
  const bottles = useAtlas((s) => s.bottles)
  const selectedMachineId = useAtlas((s) => s.selectedMachineId)
  const selectedBottleId = useAtlas((s) => s.selectedBottleId)

  const machine = useMemo(
    () => machines.find((m) => m.id === selectedMachineId) ?? null,
    [machines, selectedMachineId],
  )
  const bottle = useMemo(
    () => bottles.find((b) => b.id === selectedBottleId) ?? null,
    [bottles, selectedBottleId],
  )

  const open = !!(machine || bottle)
  return (
    <div className={`detail-panel${open ? ' open' : ''}`} aria-hidden={!open}>
      {machine && <MachineDetail machine={machine} bottles={bottles} />}
      {bottle && <BottleDetail bottle={bottle} machines={machines} />}
    </div>
  )
}

function MachineDetail({ machine, bottles }: { machine: Machine; bottles: Bottle[] }) {
  const { clearSelection, selectBottle } = useAtlas.getState()
  const stocked = machine.bottleIds
    .map((id) => bottles.find((b) => b.id === id))
    .filter((b): b is Bottle => !!b)

  return (
    <div className="detail-inner">
      <button className="detail-close" onClick={clearSelection} aria-label="Close panel">✕</button>
      <img src={machine.photoUrl} alt={machine.name} className="detail-photo" loading="lazy" />
      <div className="detail-body">
        <div className="detail-title-row">
          <h2>{machine.name}</h2>
          <span className={`status-pill ${machine.status}`}>{machine.status}</span>
        </div>
        <p className="detail-address">{machine.address}</p>
        <p className="detail-meta">
          {machine.neighborhood} · {machine.district} district
          <br />
          Installed {formatDate(machine.installDate)}
        </p>

        <h3>Bottles stocked <span className="count">{stocked.length}</span></h3>
        <div className="bottle-grid">
          {stocked.map((b) => (
            <button key={b.id} className="bottle-card" onClick={() => selectBottle(b.id)}>
              <img src={b.imageUrl} alt={b.name} loading="lazy" />
              <span className="bottle-card-name">{b.name}</span>
              <RarityBadge rarity={b.rarity} small />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function BottleDetail({ bottle, machines }: { bottle: Bottle; machines: Machine[] }) {
  const { clearSelection, selectMachine } = useAtlas.getState()
  const carriers = bottle.machineIds
    .map((id) => machines.find((m) => m.id === id))
    .filter((m): m is Machine => !!m)

  return (
    <div className="detail-inner">
      <button className="detail-close" onClick={clearSelection} aria-label="Close panel">✕</button>
      <div className="bottle-hero">
        <img src={bottle.imageUrl} alt={bottle.name} loading="lazy" />
      </div>
      <div className="detail-body">
        <div className="detail-title-row">
          <h2>{bottle.name}</h2>
          <RarityBadge rarity={bottle.rarity} />
        </div>
        <p className="detail-meta">
          {bottle.series} series · released {formatDate(bottle.releaseDate)}
        </p>
        <p className="detail-desc">{bottle.description}</p>

        <h3>
          Available at <span className="count">{carriers.length}</span> machine{carriers.length === 1 ? '' : 's'}
          <span className="hint"> — highlighted on the map</span>
        </h3>
        <ul className="carrier-list">
          {carriers.map((m) => (
            <li key={m.id}>
              <button className="row machine-row" onClick={() => selectMachine(m.id)}>
                <span className={`status-dot ${m.status}`} />
                <span className="row-main">
                  <span className="row-title">{m.name}</span>
                  <span className="row-sub">{m.neighborhood} · {m.district}</span>
                </span>
                <span className="row-arrow" aria-hidden>›</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function formatDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
