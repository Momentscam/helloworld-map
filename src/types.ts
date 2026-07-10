export type Rarity = 'common' | 'rare' | 'epic' | 'legendary'
export type MachineStatus = 'active' | 'offline'
export type Theme = 'dark' | 'light'

export interface Machine {
  id: string
  name: string
  lat: number
  lng: number
  address: string
  neighborhood: string
  district: string
  photoUrl: string
  status: MachineStatus
  installDate: string
  bottleIds: string[]
}

export interface Bottle {
  id: string
  name: string
  imageUrl: string
  series: string
  rarity: Rarity
  releaseDate: string
  description: string
  machineIds: string[]
}

export interface DistrictFeature {
  type: 'Feature'
  properties: { name: string; code: string }
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon
}

export interface DistrictCollection {
  type: 'FeatureCollection'
  features: DistrictFeature[]
}

export const RARITY_ORDER: Rarity[] = ['legendary', 'epic', 'rare', 'common']

export const RARITY_COLORS: Record<Rarity, string> = {
  common: '#8a94a6',
  rare: '#3d8bfd',
  epic: '#a855f7',
  legendary: '#f0a021',
}
