import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { STOPS } from './stops'
import { useTour } from './store'
import { easeInOutCubic } from './geo'
import { rideStates } from './rideState'

interface Flight {
  fromP: THREE.Vector3
  fromT: THREE.Vector3
  toP: THREE.Vector3
  toT: THREE.Vector3
  start: number
  dur: number
}

export default function CameraRig() {
  const controls = useRef<OrbitControlsImpl>(null)
  const { camera } = useThree()
  const stopIndex = useTour((s) => s.stopIndex)
  const mode = useTour((s) => s.mode)
  const flying = useTour((s) => s.flying)
  const flight = useRef<Flight | null>(null)
  const tmp = useMemo(
    () => ({
      p: new THREE.Vector3(),
      t: new THREE.Vector3(),
      fwd: new THREE.Vector3(),
      right: new THREE.Vector3(),
      step: new THREE.Vector3(),
    }),
    [],
  )

  useEffect(() => {
    if (import.meta.env.DEV) {
      ;(window as unknown as Record<string, unknown>).__controls = controls.current
    }
  })

  useEffect(() => {
    if (mode !== 'tour' || !controls.current) return
    const stop = STOPS[stopIndex]
    const toP = new THREE.Vector3(...stop.cam.pos)
    const toT = new THREE.Vector3(...stop.cam.target)
    // on mobile the stop card covers the lower half — tilt down so the
    // subject sits in the visible upper part of the screen
    if (stopIndex > 0 && window.matchMedia('(max-width: 860px)').matches) {
      toT.y -= toP.distanceTo(toT) * 0.32
    }
    const dist = camera.position.distanceTo(toP)
    if (dist < 1) return
    flight.current = {
      fromP: camera.position.clone(),
      fromT: controls.current.target.clone(),
      toP,
      toT,
      start: performance.now(),
      dur: Math.min(2600, 900 + dist * 2.2),
    }
    useTour.getState().setFlying(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stopIndex, mode])

  useFrame((_, dt) => {
    const c = controls.current
    if (!c) return

    if (mode === 'ride') {
      flight.current = null
      const target = useTour.getState().rideTarget
      const rs = rideStates[target]
      if (target === 'tram') {
        // chase cam behind the tram
        const k = 1 - Math.pow(0.002, dt)
        tmp.p.copy(rs.dir).multiplyScalar(-36)
        tmp.p.y = 21
        tmp.p.add(rs.pos)
        camera.position.lerp(tmp.p, k)
        tmp.t.copy(rs.dir).multiplyScalar(30).add(rs.pos)
        c.target.lerp(tmp.t, k)
      } else {
        // window seat: camera rides inside the vehicle (near-plane clips the shell)
        const k = 1 - Math.pow(0.0004, dt)
        tmp.p.copy(rs.pos)
        tmp.p.y += target === 'plane' ? 0.55 : 0.45
        camera.position.lerp(tmp.p, k)
        tmp.t.copy(rs.dir).multiplyScalar(45).add(rs.pos)
        // gaze dips toward the city below
        tmp.t.y -= target === 'plane' ? 10 : 9
        c.target.lerp(tmp.t, k)
      }
      c.update()
      return
    }

    // WASD free movement — slides camera and orbit target together, so the
    // mouse keeps working for looking around. Grabbing the keys mid-flight
    // hands control straight back to the user.
    const mv = useTour.getState().move
    const moving = mv.w || mv.a || mv.s || mv.d
    if (moving) {
      if (flight.current) {
        flight.current = null
        useTour.getState().setFlying(false)
      }
      tmp.fwd.set(c.target.x - camera.position.x, 0, c.target.z - camera.position.z).normalize()
      tmp.right.set(-tmp.fwd.z, 0, tmp.fwd.x)
      tmp.step
        .set(0, 0, 0)
        .addScaledVector(tmp.fwd, Number(mv.w) - Number(mv.s))
        .addScaledVector(tmp.right, Number(mv.d) - Number(mv.a))
      if (tmp.step.lengthSq() > 0) {
        // speed follows zoom: gentle at street level, fast when zoomed out
        const speed =
          THREE.MathUtils.clamp(camera.position.distanceTo(c.target) * 0.75, 24, 320) *
          (mv.boost ? 2.4 : 1) *
          dt
        tmp.step.normalize().multiplyScalar(speed)
        camera.position.add(tmp.step)
        c.target.add(tmp.step)
        c.update()
      }
    }

    const f = flight.current
    if (f) {
      const t = Math.min(1, (performance.now() - f.start) / f.dur)
      const e = easeInOutCubic(t)
      camera.position.lerpVectors(f.fromP, f.toP, e)
      c.target.lerpVectors(f.fromT, f.toT, e)
      c.update()
      if (t >= 1) {
        flight.current = null
        useTour.getState().setFlying(false)
      }
      return
    }

    // keep the target on the board while exploring
    c.target.x = THREE.MathUtils.clamp(c.target.x, -560, 560)
    c.target.z = THREE.MathUtils.clamp(c.target.z, -360, 420)
    c.target.y = THREE.MathUtils.clamp(c.target.y, 0, 180)
  })

  return (
    <OrbitControls
      ref={controls}
      enabled={mode !== 'ride' && !flying}
      enableDamping
      dampingFactor={0.08}
      maxPolarAngle={1.42}
      minDistance={18}
      maxDistance={980}
      target={STOPS[0].cam.target}
    />
  )
}
