import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import { STOPS } from './stops'
import { useTour } from './store'
import { createLightState, lightingAt, sunPositionAt } from './lighting'
import City from './City'
import Landmarks from './Landmarks'
import Movers from './Movers'
import Labels from './Labels'
import CameraRig from './CameraRig'

/** drives sky, fog, sun, moon and hemisphere light from the store clock */
function DayNightRig() {
  const sun = useRef<THREE.DirectionalLight>(null)
  const moon = useRef<THREE.DirectionalLight>(null)
  const hemi = useRef<THREE.HemisphereLight>(null)
  const state = useMemo(createLightState, [])
  const sunPos = useMemo(() => new THREE.Vector3(), [])

  useFrame(({ scene }) => {
    const t = useTour.getState().timeOfDay
    lightingAt(t, state)
    if (scene.background instanceof THREE.Color) scene.background.copy(state.sky)
    if (scene.fog) scene.fog.color.copy(state.sky)
    if (sun.current) {
      sun.current.color.copy(state.sun)
      sun.current.intensity = state.sunI
      sun.current.position.copy(sunPositionAt(t, sunPos))
    }
    if (moon.current) moon.current.intensity = 0.34 * state.glow
    if (hemi.current) {
      hemi.current.color.copy(state.hemiSky)
      hemi.current.groundColor.copy(state.hemiGround)
      hemi.current.intensity = state.hemiI
    }
  })

  return (
    <>
      <color attach="background" args={['#cfe8f7']} />
      <fog attach="fog" args={['#cfe8f7', 950, 2400]} />
      <hemisphereLight ref={hemi} args={['#e8f4ff', '#cabfa2', 0.95]} />
      <directionalLight ref={sun} position={[350, 500, 250]} intensity={1.3} />
      <directionalLight ref={moon} position={[-260, 320, -180]} intensity={0} color="#8fa8d8" />
    </>
  )
}

export default function Scene() {
  return (
    <Canvas
      className="scene-canvas"
      dpr={[1, 2]}
      camera={{ position: STOPS[0].cam.pos, fov: 38, near: 2, far: 3200 }}
      gl={{ antialias: true }}
      onCreated={(state) => {
        if (import.meta.env.DEV) {
          ;(window as unknown as Record<string, unknown>).__cam = state.camera
          ;(window as unknown as Record<string, unknown>).__scene = state.scene
        }
      }}
    >
      <DayNightRig />
      <City />
      <Landmarks />
      <Movers />
      <Labels />
      <CameraRig />
    </Canvas>
  )
}
