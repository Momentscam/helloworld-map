import { useMemo } from 'react'
import { bottleMatchesFilters, machineMatchesFilters, useAtlas } from '../store'
import type { Bottle, Machine, Rarity } from '../types'
import RarityBadge from './RarityBadge'

const RARITIES: Rarity[] = ['common', 'rare', 'epic', 'legendary']

export default function Sidebar() {
  const machines = useAtlas((s) => s.machines)
  const bottles = useAtlas((s) => s.bottles)
  const districts = useAtlas((s) => s.districts)
  const filters = useAtlas((s) => s.filters)
  const theme = useAtlas((s) => s.theme)
  const visibleMachineIds = useAtlas((s) => s.visibleMachineIds)
  const selectedMachineId = useAtlas((s) => s.selectedMachineId)
  const selectedBottleId = useAtlas((s) => s.selectedBottleId)
  const sheetOpen = useAtlas((s) => s.sheetOpen)

  const {
    setQuery, setDistrict, setSeries, setRarity, clearFilters,
    selectMachine, selectBottle, setHoveredDistrict, toggleTheme, setSheetOpen,
  } = useAtlas.getState()

  const machineById = useMemo(() => new Map(machines.map((m) => [m.id, m])), [machines])
  const bottleById = useMemo(() => new Map(bottles.map((b) => [b.id, b])), [bottles])

  const districtNames = useMemo(
    () => (districts ? [...districts.features.map((f) => f.properties.name)].sort((a, b) => a.localeCompare(b)) : []),
    [districts],
  )
  const seriesNames = useMemo(() => [...new Set(bottles.map((b) => b.series))], [bottles])

  const filteredMachines = useMemo(
    () => machines.filter((m) => machineMatchesFilters(m, filters, bottleById)),
    [machines, filters, bottleById],
  )
  const filteredBottles = useMemo(
    () => bottles.filter((b) => bottleMatchesFilters(b, filters, machineById)),
    [bottles, filters, machineById],
  )

  // machines list syncs with the map viewport
  const visibleSet = useMemo(() => new Set(visibleMachineIds), [visibleMachineIds])
  const machinesInView = filteredMachines.filter((m) => visibleSet.has(m.id))
  const machinesOutOfView = filteredMachines.length - machinesInView.length

  const hasFilters = !!(filters.query || filters.district || filters.series || filters.rarity)

  return (
    <aside className={`sidebar${sheetOpen ? ' open' : ''}`}>
      <button className="sheet-handle" onClick={() => setSheetOpen(!sheetOpen)} aria-label="Toggle panel">
        <span />
      </button>

      <header className="sidebar-head">
        <div className="brand">
          <span className="brand-mark">🍾</span>
          <div>
            <h1>Bottle Atlas</h1>
            <p>Barcelona · {machines.length} machines · {bottles.length} bottles</p>
          </div>
        </div>
        <button className="theme-toggle" onClick={toggleTheme} title="Toggle light/dark map" aria-label="Toggle theme">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </header>

      <div className="search-wrap">
        <svg viewBox="0 0 20 20" className="search-icon" aria-hidden>
          <circle cx="9" cy="9" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
          <line x1="13.5" y1="13.5" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          value={filters.query}
          placeholder="Search machines & bottles…"
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setSheetOpen(true)}
        />
      </div>

      <div className="filters">
        <FilterRow label="District">
          {districtNames.map((d) => (
            <button
              key={d}
              className={`chip${filters.district === d ? ' active' : ''}`}
              onClick={() => setDistrict(filters.district === d ? null : d)}
              onMouseEnter={() => setHoveredDistrict(d)}
              onMouseLeave={() => setHoveredDistrict(null)}
            >
              {d}
            </button>
          ))}
        </FilterRow>
        <FilterRow label="Series">
          {seriesNames.map((sName) => (
            <button
              key={sName}
              className={`chip${filters.series === sName ? ' active' : ''}`}
              onClick={() => setSeries(filters.series === sName ? null : sName)}
            >
              {sName}
            </button>
          ))}
        </FilterRow>
        <FilterRow label="Rarity">
          {RARITIES.map((r) => (
            <button
              key={r}
              className={`chip chip-${r}${filters.rarity === r ? ' active' : ''}`}
              onClick={() => setRarity(filters.rarity === r ? null : r)}
            >
              {r}
            </button>
          ))}
        </FilterRow>
        {hasFilters && (
          <button className="clear-filters" onClick={clearFilters}>
            Clear all filters
          </button>
        )}
      </div>

      <div className="results">
        <section>
          <h2>
            Machines in view <span className="count">{machinesInView.length}</span>
            {machinesOutOfView > 0 && <span className="muted"> · {machinesOutOfView} outside map</span>}
          </h2>
          {machinesInView.length === 0 && <p className="empty">No machines here — pan the map or clear filters.</p>}
          <ul className="machine-list">
            {machinesInView.map((m) => (
              <MachineRow key={m.id} m={m} active={m.id === selectedMachineId} onClick={() => { selectMachine(m.id); setSheetOpen(false) }} />
            ))}
          </ul>
        </section>

        <section>
          <h2>
            Bottles <span className="count">{filteredBottles.length}</span>
          </h2>
          {filteredBottles.length === 0 && <p className="empty">No bottles match these filters.</p>}
          <ul className="bottle-list">
            {filteredBottles.map((b) => (
              <BottleRow key={b.id} b={b} active={b.id === selectedBottleId} onClick={() => { selectBottle(b.id); setSheetOpen(false) }} />
            ))}
          </ul>
        </section>
      </div>
    </aside>
  )
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="filter-row">
      <span className="filter-label">{label}</span>
      <div className="chips">{children}</div>
    </div>
  )
}

function MachineRow({ m, active, onClick }: { m: Machine; active: boolean; onClick: () => void }) {
  return (
    <li>
      <button className={`row machine-row${active ? ' active' : ''}`} onClick={onClick}>
        <span className={`status-dot ${m.status}`} title={m.status} />
        <span className="row-main">
          <span className="row-title">{m.name}</span>
          <span className="row-sub">
            {m.neighborhood} · {m.bottleIds.length} bottle{m.bottleIds.length === 1 ? '' : 's'}
          </span>
        </span>
        <span className="row-arrow" aria-hidden>›</span>
      </button>
    </li>
  )
}

function BottleRow({ b, active, onClick }: { b: Bottle; active: boolean; onClick: () => void }) {
  return (
    <li>
      <button className={`row bottle-row${active ? ' active' : ''}`} onClick={onClick}>
        <img src={b.imageUrl} alt="" loading="lazy" className="row-thumb" />
        <span className="row-main">
          <span className="row-title">{b.name}</span>
          <span className="row-sub">
            {b.series} · {b.machineIds.length} location{b.machineIds.length === 1 ? '' : 's'}
          </span>
        </span>
        <RarityBadge rarity={b.rarity} small />
      </button>
    </li>
  )
}
