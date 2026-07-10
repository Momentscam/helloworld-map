import { create } from 'zustand'
import { fetchBottles, fetchDistricts, fetchMachines } from './api'
import type { Bottle, DistrictCollection, Machine, Rarity, Theme } from './types'

export interface Filters {
  query: string
  district: string | null
  series: string | null
  rarity: Rarity | null
}

interface AtlasState {
  machines: Machine[]
  bottles: Bottle[]
  districts: DistrictCollection | null
  loading: boolean
  error: string | null

  theme: Theme
  filters: Filters
  selectedMachineId: string | null
  selectedBottleId: string | null
  hoveredDistrict: string | null
  visibleMachineIds: string[]
  sheetOpen: boolean

  loadData: () => Promise<void>
  setTheme: (t: Theme) => void
  toggleTheme: () => void
  setQuery: (q: string) => void
  setDistrict: (d: string | null) => void
  setSeries: (s: string | null) => void
  setRarity: (r: Rarity | null) => void
  clearFilters: () => void
  selectMachine: (id: string | null) => void
  selectBottle: (id: string | null) => void
  clearSelection: () => void
  setHoveredDistrict: (d: string | null) => void
  setVisibleMachineIds: (ids: string[]) => void
  setSheetOpen: (open: boolean) => void
}

// ---- URL state --------------------------------------------------------
const URL_KEYS = ['q', 'district', 'series', 'rarity', 'm', 'b', 'theme'] as const

function readUrlState() {
  const p = new URLSearchParams(window.location.search)
  const rarity = p.get('rarity')
  const theme = p.get('theme')
  return {
    filters: {
      query: p.get('q') ?? '',
      district: p.get('district'),
      series: p.get('series'),
      rarity: rarity && ['common', 'rare', 'epic', 'legendary'].includes(rarity) ? (rarity as Rarity) : null,
    },
    selectedMachineId: p.get('m'),
    selectedBottleId: p.get('b'),
    theme: (theme === 'light' || theme === 'dark'
      ? theme
      : window.matchMedia?.('(prefers-color-scheme: light)').matches
        ? 'light'
        : 'dark') as Theme,
  }
}

function writeUrlState(s: AtlasState) {
  const p = new URLSearchParams(window.location.search)
  URL_KEYS.forEach((k) => p.delete(k))
  if (s.filters.query) p.set('q', s.filters.query)
  if (s.filters.district) p.set('district', s.filters.district)
  if (s.filters.series) p.set('series', s.filters.series)
  if (s.filters.rarity) p.set('rarity', s.filters.rarity)
  if (s.selectedMachineId) p.set('m', s.selectedMachineId)
  if (s.selectedBottleId) p.set('b', s.selectedBottleId)
  p.set('theme', s.theme)
  const qs = p.toString()
  window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname)
}

const initial = readUrlState()

export const useAtlas = create<AtlasState>((set) => ({
  machines: [],
  bottles: [],
  districts: null,
  loading: true,
  error: null,

  theme: initial.theme,
  filters: initial.filters,
  selectedMachineId: initial.selectedMachineId,
  selectedBottleId: initial.selectedBottleId,
  hoveredDistrict: null,
  visibleMachineIds: [],
  sheetOpen: false,

  loadData: async () => {
    try {
      const [machines, bottles, districts] = await Promise.all([
        fetchMachines(),
        fetchBottles(),
        fetchDistricts(),
      ])
      set({ machines, bottles, districts, loading: false })
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e), loading: false })
    }
  },

  setTheme: (theme) => set({ theme }),
  toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
  setQuery: (query) => set((s) => ({ filters: { ...s.filters, query } })),
  setDistrict: (district) => set((s) => ({ filters: { ...s.filters, district } })),
  setSeries: (series) => set((s) => ({ filters: { ...s.filters, series } })),
  setRarity: (rarity) => set((s) => ({ filters: { ...s.filters, rarity } })),
  clearFilters: () => set({ filters: { query: '', district: null, series: null, rarity: null } }),

  selectMachine: (id) => set({ selectedMachineId: id, selectedBottleId: null }),
  selectBottle: (id) => set({ selectedBottleId: id, selectedMachineId: null }),
  clearSelection: () => set({ selectedMachineId: null, selectedBottleId: null }),
  setHoveredDistrict: (hoveredDistrict) => set({ hoveredDistrict }),
  setVisibleMachineIds: (ids) =>
    set((s) => (arraysEqual(s.visibleMachineIds, ids) ? s : { visibleMachineIds: ids })),
  setSheetOpen: (sheetOpen) => set({ sheetOpen }),
}))

if (import.meta.env.DEV) {
  ;(window as unknown as Record<string, unknown>).__atlas = useAtlas
}

function arraysEqual(a: string[], b: string[]) {
  return a.length === b.length && a.every((v, i) => v === b[i])
}

// Keep the URL in sync so views are shareable.
useAtlas.subscribe((s, prev) => {
  if (
    s.filters !== prev.filters ||
    s.selectedMachineId !== prev.selectedMachineId ||
    s.selectedBottleId !== prev.selectedBottleId ||
    s.theme !== prev.theme
  ) {
    writeUrlState(s)
  }
})

// ---- filtering helpers (pure; used by sidebar + map) -------------------
export function bottleMatchesFilters(b: Bottle, f: Filters, machineById: Map<string, Machine>): boolean {
  if (f.series && b.series !== f.series) return false
  if (f.rarity && b.rarity !== f.rarity) return false
  if (f.district && !b.machineIds.some((id) => machineById.get(id)?.district === f.district)) return false
  if (f.query) {
    const q = f.query.toLowerCase()
    if (!b.name.toLowerCase().includes(q) && !b.series.toLowerCase().includes(q)) return false
  }
  return true
}

export function machineMatchesFilters(m: Machine, f: Filters, bottleById: Map<string, Bottle>): boolean {
  if (f.district && m.district !== f.district) return false
  if (f.series || f.rarity) {
    const stocksMatch = m.bottleIds.some((id) => {
      const b = bottleById.get(id)
      if (!b) return false
      if (f.series && b.series !== f.series) return false
      if (f.rarity && b.rarity !== f.rarity) return false
      return true
    })
    if (!stocksMatch) return false
  }
  if (f.query) {
    const q = f.query.toLowerCase()
    const hay = `${m.name} ${m.address} ${m.neighborhood} ${m.district}`.toLowerCase()
    if (!hay.includes(q)) return false
  }
  return true
}
