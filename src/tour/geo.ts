import * as THREE from 'three'

/** deterministic rng so the city doesn't reshuffle on hot reload */
export function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a += 0x6d2b79f5
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export type Pt = [number, number] // x, z

export interface PathFollower {
  total: number
  pts: Pt[]
  at(dist: number): { x: number; z: number; angle: number }
}

/** polyline follower: distance -> position + heading (angle around Y, +z forward) */
export function makePath(pts: Pt[]): PathFollower {
  const lens: number[] = [0]
  for (let i = 1; i < pts.length; i++) {
    lens.push(lens[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]))
  }
  const total = lens[lens.length - 1]
  return {
    total,
    pts,
    at(dist) {
      const d = ((dist % total) + total) % total
      let i = 1
      while (i < lens.length - 1 && lens[i] < d) i++
      const t = (d - lens[i - 1]) / (lens[i] - lens[i - 1] || 1)
      const [x1, z1] = pts[i - 1]
      const [x2, z2] = pts[i]
      return { x: x1 + (x2 - x1) * t, z: z1 + (z2 - z1) * t, angle: Math.atan2(x2 - x1, z2 - z1) }
    },
  }
}

/** flat ground polygon (authored in x/z) -> geometry lying on y=0 */
export function groundShape(pts: Pt[]): THREE.ShapeGeometry {
  const shape = new THREE.Shape()
  shape.moveTo(pts[0][0], pts[0][1])
  for (let i = 1; i < pts.length; i++) shape.lineTo(pts[i][0], pts[i][1])
  shape.closePath()
  const g = new THREE.ShapeGeometry(shape)
  g.rotateX(Math.PI / 2)
  return g
}

export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

/** position-hashed noise: identical for seam-duplicated vertices, so no tearing */
const hash3 = (x: number, y: number, z: number, s: number) => {
  const n = Math.sin(x * 127.1 + y * 311.7 + z * 74.7 + s * 269.5) * 43758.5453
  return n - Math.floor(n)
}

/**
 * craggy-mountain vertex jitter. `fade` keeps a region clean (e.g. a summit
 * terrace): full displacement below fade.from, none above fade.to (local y).
 */
export function displace(
  g: THREE.BufferGeometry,
  amp: number,
  ampY: number,
  fade?: { from: number; to: number },
): THREE.BufferGeometry {
  const pos = g.getAttribute('position') as THREE.BufferAttribute
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const y = pos.getY(i)
    const z = pos.getZ(i)
    let k = 1
    if (fade) k = 1 - THREE.MathUtils.clamp((y - fade.from) / (fade.to - fade.from), 0, 1)
    if (k <= 0) continue
    pos.setXYZ(
      i,
      x + (hash3(x, y, z, 1) - 0.5) * amp * k,
      y + (hash3(x, y, z, 2) - 0.5) * ampY * k,
      z + (hash3(x, y, z, 3) - 0.5) * amp * k,
    )
  }
  pos.needsUpdate = true
  g.computeVertexNormals()
  return g
}

// ---- palette ------------------------------------------------------------
export const C = {
  sea: '#4a94c8',
  seaShallow: '#7dbbdf',
  land: '#efe7d7',
  beach: '#f2e3b6',
  park: '#a9c98a',
  ridge: '#8fb573',
  ridgeDark: '#7aa361',
  road: '#8d9099',
  roadMinor: '#c9c3b6',
  rail: '#7c8894',
  building: ['#e9dcc6', '#e2d2b8', '#dbc6a8', '#efe2cd', '#d9c9ae', '#e6d5bd'],
  buildingAccent: ['#cf8f70', '#a8bfd0', '#c2ac8a'],
  roofs: '#c96a4a',
  car: ['#d94f3d', '#3d76c9', '#e8b93c', '#f2f2f2', '#4aa46a', '#333a45', '#e07a2f'],
}

// major roads (also used by traffic) -------------------------------------
export const ROADS: Record<string, Pt[]> = {
  granVia: [[-320, 0], [390, 0]],
  arago: [[-200, -44], [260, -44]],
  passeigGracia: [[0, -110], [0, 40]],
  diagonal: [[-280, -140], [0, -66], [340, 22]],
  ronda: [[-380, 208], [-240, 168], [-40, 132], [140, 96], [260, 74], [430, 26]],
  airportLink: [[-240, 168], [-300, 178], [-332, 183]],
  meridiana: [[154, 40], [300, -130]],
  tibidaboAve: [[-88, -110], [-88, -148]],
  mountainRoad: [[-88, -148], [-118, -160], [-76, -172]],
}

export const RAMBLA: Pt[] = [[33, 38], [66, 112]]
