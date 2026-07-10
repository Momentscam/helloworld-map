import type { Bottle, DistrictCollection, Machine } from './types'

// Data access layer. v1 reads static files from /public/data; swap these
// implementations for real API calls without touching the rest of the app.
const BASE = '/data'

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}/${path}`)
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`)
  return res.json() as Promise<T>
}

export const fetchMachines = () => getJson<Machine[]>('machines.json')
export const fetchBottles = () => getJson<Bottle[]>('bottles.json')
export const fetchDistricts = () => getJson<DistrictCollection>('barcelona-districts.geojson')
