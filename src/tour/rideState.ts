import * as THREE from 'three'

/** rideable vehicles — each writes its live pose every frame */
export type RideTarget = 'tram' | 'plane' | 'teleferic'

export interface RidePose {
  pos: THREE.Vector3
  dir: THREE.Vector3
}

export const rideStates: Record<RideTarget, RidePose> = {
  tram: { pos: new THREE.Vector3(0, 2, -66), dir: new THREE.Vector3(1, 0, 0) },
  plane: { pos: new THREE.Vector3(-76, 116, -274), dir: new THREE.Vector3(1, 0, 0) },
  teleferic: { pos: new THREE.Vector3(-180, 8, 52), dir: new THREE.Vector3(-0.5, 0, 0.85) },
}

export const RIDE_LABELS: Record<RideTarget, string> = {
  tram: 'RIDE THE TRAM',
  plane: 'RIDE THE TIBIDABO PLANE',
  teleferic: 'RIDE THE TELEFÈRIC',
}
