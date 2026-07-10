import * as THREE from 'three'

// Day/night lighting keyframes, interpolated by hour (0–24).
// `glow` drives emissive window intensity on the buildings.
interface Keyframe {
  h: number
  sky: THREE.Color
  sun: THREE.Color
  sunI: number
  hemiSky: THREE.Color
  hemiGround: THREE.Color
  hemiI: number
  glow: number
}

const kf = (
  h: number,
  sky: string,
  sun: string,
  sunI: number,
  hemiSky: string,
  hemiGround: string,
  hemiI: number,
  glow: number,
): Keyframe => ({
  h,
  sky: new THREE.Color(sky),
  sun: new THREE.Color(sun),
  sunI,
  hemiSky: new THREE.Color(hemiSky),
  hemiGround: new THREE.Color(hemiGround),
  hemiI,
  glow,
})

const FRAMES: Keyframe[] = [
  kf(0, '#101a2e', '#9fb4d8', 0, '#2a3854', '#141419', 0.34, 1),
  kf(5, '#141f36', '#9fb4d8', 0, '#2a3854', '#141419', 0.36, 1),
  kf(6.5, '#54506e', '#ff9a5c', 0.35, '#7a7290', '#3a3240', 0.55, 0.75),
  kf(7.6, '#e8a97c', '#ffb36b', 0.95, '#ffd8b0', '#8a7a68', 0.75, 0.25),
  kf(9.5, '#c3e2f5', '#fff0d8', 1.25, '#e8f4ff', '#cabfa2', 0.95, 0),
  kf(13.5, '#cfe8f7', '#fff6e8', 1.35, '#e8f4ff', '#cabfa2', 1, 0),
  kf(18, '#c4daee', '#ffe8c4', 1.1, '#dcedfc', '#c0b498', 0.9, 0),
  kf(19.9, '#f0b678', '#ff9e55', 0.8, '#ffd0a0', '#7a6a58', 0.7, 0.25),
  kf(21, '#8a5a72', '#ff7448', 0.35, '#9a7088', '#40303c', 0.5, 0.6),
  kf(22.2, '#1c2440', '#9fb4d8', 0.05, '#303e5e', '#181820', 0.38, 0.95),
  kf(24, '#101a2e', '#9fb4d8', 0, '#2a3854', '#141419', 0.34, 1),
]

export interface LightState {
  sky: THREE.Color
  sun: THREE.Color
  sunI: number
  hemiSky: THREE.Color
  hemiGround: THREE.Color
  hemiI: number
  glow: number
}

export function createLightState(): LightState {
  return {
    sky: new THREE.Color(),
    sun: new THREE.Color(),
    sunI: 0,
    hemiSky: new THREE.Color(),
    hemiGround: new THREE.Color(),
    hemiI: 0,
    glow: 0,
  }
}

/** interpolated lighting for an hour of day, written into `out` (no allocs) */
export function lightingAt(hour: number, out: LightState): LightState {
  const t = ((hour % 24) + 24) % 24
  let i = 0
  while (i < FRAMES.length - 2 && FRAMES[i + 1].h <= t) i++
  const a = FRAMES[i]
  const b = FRAMES[i + 1]
  const k = (t - a.h) / (b.h - a.h || 1)
  out.sky.lerpColors(a.sky, b.sky, k)
  out.sun.lerpColors(a.sun, b.sun, k)
  out.hemiSky.lerpColors(a.hemiSky, b.hemiSky, k)
  out.hemiGround.lerpColors(a.hemiGround, b.hemiGround, k)
  out.sunI = a.sunI + (b.sunI - a.sunI) * k
  out.hemiI = a.hemiI + (b.hemiI - a.hemiI) * k
  out.glow = a.glow + (b.glow - a.glow) * k
  return out
}

/** window-glow factor only (for building materials) */
const scratch = createLightState()
export function windowGlowAt(hour: number): number {
  return lightingAt(hour, scratch).glow
}

/** sun position over the board — east horizon ~6h, west horizon ~21h */
export function sunPositionAt(hour: number, out: THREE.Vector3): THREE.Vector3 {
  const theta = (Math.PI * (hour - 6)) / 15
  out.set(Math.cos(theta) * 420, Math.max(Math.sin(theta), 0.06) * 460, 240)
  return out
}
