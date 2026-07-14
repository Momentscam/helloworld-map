import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { C, ROADS, makePath, mulberry32, type PathFollower } from './geo'
import { PlaneModel } from './Landmarks'
import { rideStates } from './rideState'

// ---------------------------------------------------------------- cars
interface Car {
  path: PathFollower
  offset: number
  speed: number
  lane: number
  color: THREE.Color
}

const mat4 = (px: number, py: number, pz: number, sx: number, sy: number, sz: number) =>
  new THREE.Matrix4().compose(
    new THREE.Vector3(px, py, pz),
    new THREE.Quaternion(),
    new THREE.Vector3(sx, sy, sz),
  )

// local part transforms relative to the car origin (ground, +z forward)
const CAR_PARTS = {
  body: mat4(0, 0.82, 0.05, 1.9, 0.78, 4.2),
  cabin: mat4(0, 1.5, -0.32, 1.62, 0.6, 2.1),
  wheels: [
    mat4(-0.9, 0.42, 1.32, 1, 1, 1),
    mat4(0.9, 0.42, 1.32, 1, 1, 1),
    mat4(-0.9, 0.42, -1.32, 1, 1, 1),
    mat4(0.9, 0.42, -1.32, 1, 1, 1),
  ],
  heads: [mat4(-0.55, 0.92, 2.14, 0.44, 0.2, 0.14), mat4(0.55, 0.92, 2.14, 0.44, 0.2, 0.14)],
  rear: mat4(0, 0.96, -2.08, 1.5, 0.18, 0.12),
}

function Cars() {
  const bodyRef = useRef<THREE.InstancedMesh>(null)
  const cabinRef = useRef<THREE.InstancedMesh>(null)
  const wheelRef = useRef<THREE.InstancedMesh>(null)
  const headRef = useRef<THREE.InstancedMesh>(null)
  const rearRef = useRef<THREE.InstancedMesh>(null)

  const cars = useMemo<Car[]>(() => {
    const rng = mulberry32(2024)
    const out: Car[] = []
    const drivable = ['granVia', 'arago', 'passeigGracia', 'diagonal', 'ronda', 'airportLink', 'meridiana']
    for (const key of drivable) {
      const fwd = makePath(ROADS[key])
      const rev = makePath([...ROADS[key]].reverse())
      for (const path of [fwd, rev]) {
        const n = Math.max(2, Math.round(path.total / 55))
        for (let i = 0; i < n; i++) {
          out.push({
            path,
            offset: (path.total / n) * i + rng() * 20,
            speed: 13 + rng() * 9,
            lane: 1.7,
            color: new THREE.Color(C.car[Math.floor(rng() * C.car.length)]),
          })
        }
      }
    }
    return out
  }, [])

  const wheelGeom = useMemo(() => {
    const g = new THREE.CylinderGeometry(0.42, 0.42, 0.34, 8)
    g.rotateZ(Math.PI / 2)
    return g
  }, [])

  const tmp = useMemo(() => ({ base: new THREE.Matrix4(), part: new THREE.Matrix4(), q: new THREE.Quaternion(), up: new THREE.Vector3(0, 1, 0), p: new THREE.Vector3(), one: new THREE.Vector3(1, 1, 1) }), [])

  useFrame(({ clock }) => {
    const body = bodyRef.current, cabin = cabinRef.current, wheel = wheelRef.current, head = headRef.current, rear = rearRef.current
    if (!body || !cabin || !wheel || !head || !rear) return
    const t = clock.elapsedTime
    cars.forEach((car, i) => {
      const p = car.path.at(car.offset + t * car.speed)
      const rx = Math.cos(p.angle) * car.lane
      const rz = -Math.sin(p.angle) * car.lane
      tmp.q.setFromAxisAngle(tmp.up, p.angle)
      tmp.p.set(p.x + rx, 0, p.z + rz)
      tmp.base.compose(tmp.p, tmp.q, tmp.one)
      body.setMatrixAt(i, tmp.part.multiplyMatrices(tmp.base, CAR_PARTS.body))
      cabin.setMatrixAt(i, tmp.part.multiplyMatrices(tmp.base, CAR_PARTS.cabin))
      rear.setMatrixAt(i, tmp.part.multiplyMatrices(tmp.base, CAR_PARTS.rear))
      for (let k = 0; k < 4; k++) {
        wheel.setMatrixAt(i * 4 + k, tmp.part.multiplyMatrices(tmp.base, CAR_PARTS.wheels[k]))
      }
      for (let k = 0; k < 2; k++) {
        head.setMatrixAt(i * 2 + k, tmp.part.multiplyMatrices(tmp.base, CAR_PARTS.heads[k]))
      }
    })
    body.instanceMatrix.needsUpdate = true
    cabin.instanceMatrix.needsUpdate = true
    wheel.instanceMatrix.needsUpdate = true
    head.instanceMatrix.needsUpdate = true
    rear.instanceMatrix.needsUpdate = true
  })

  return (
    <group>
      <instancedMesh
        ref={bodyRef}
        args={[undefined, undefined, cars.length]}
        onUpdate={(m) => {
          cars.forEach((c, i) => m.setColorAt(i, c.color))
          if (m.instanceColor) m.instanceColor.needsUpdate = true
        }}
      >
        <boxGeometry />
        <meshLambertMaterial />
      </instancedMesh>
      <instancedMesh ref={cabinRef} args={[undefined, undefined, cars.length]}>
        <boxGeometry />
        <meshStandardMaterial color="#2b3947" roughness={0.25} metalness={0.15} />
      </instancedMesh>
      <instancedMesh ref={wheelRef} args={[wheelGeom, undefined, cars.length * 4]}>
        <meshLambertMaterial color="#1f2227" />
      </instancedMesh>
      <instancedMesh ref={headRef} args={[undefined, undefined, cars.length * 2]}>
        <boxGeometry />
        <meshBasicMaterial color="#fff3c4" />
      </instancedMesh>
      <instancedMesh ref={rearRef} args={[undefined, undefined, cars.length]}>
        <boxGeometry />
        <meshBasicMaterial color="#e8402f" />
      </instancedMesh>
    </group>
  )
}

// ---------------------------------------------------------------- trams
function pingPong(dist: number, total: number) {
  const u = dist % (2 * total)
  return u < total ? { d: u, flip: 0 } : { d: 2 * total - u, flip: Math.PI }
}

function TramCar({ color, refObj }: { color: string; refObj: React.RefObject<THREE.Group> }) {
  return (
    <group ref={refObj}>
      {/* body */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[2.4, 2.1, 5.2]} />
        <meshLambertMaterial color={color} />
      </mesh>
      {/* window band */}
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[2.45, 0.85, 5.05]} />
        <meshStandardMaterial color="#26303c" roughness={0.3} metalness={0.1} />
      </mesh>
      {/* skirt */}
      <mesh position={[0, -0.85, 0]}>
        <boxGeometry args={[2.2, 0.5, 4.8]} />
        <meshLambertMaterial color="#3a4048" />
      </mesh>
      {/* roof */}
      <mesh position={[0, 1.28, 0]}>
        <boxGeometry args={[2.25, 0.35, 4.9]} />
        <meshLambertMaterial color="#e9eef2" />
      </mesh>
      {/* pantograph */}
      <mesh position={[0, 1.85, 0.4]} rotation-x={0.55}>
        <boxGeometry args={[0.1, 0.1, 1.6]} />
        <meshLambertMaterial color="#444a54" />
      </mesh>
      <mesh position={[0, 2.35, 0]} rotation-y={Math.PI / 2}>
        <boxGeometry args={[0.12, 0.08, 1.3]} />
        <meshLambertMaterial color="#444a54" />
      </mesh>
    </group>
  )
}

/* the green tram calls at stations along the Diagonal — fractions of the
   route, picked so the chase cam parks clear of L'Illa and the HQ tower */
const TRAM_STOPS = [0.44, 0.76]
const TRAM_SPEED = 16
const TRAM_DWELL = 2.8

function Trams() {
  const green = useMemo(() => makePath(ROADS.diagonal), [])
  const blue = useMemo(() => makePath(ROADS.tibidaboAve), [])
  const g1 = useRef<THREE.Group>(null)
  const g2 = useRef<THREE.Group>(null)
  const g3 = useRef<THREE.Group>(null)
  const b1 = useRef<THREE.Group>(null)

  // station distances unfolded over the ping-pong cycle, so the tram calls
  // at the same platforms in both directions
  const stationDs = useMemo(() => {
    const T = green.total
    const s = TRAM_STOPS.map((f) => f * T)
    return [...s, ...s.map((v) => 2 * T - v)]
  }, [green])

  const drive = useRef({ head: 12, v: TRAM_SPEED, dwell: 0 })

  // platform positions for the little station props
  const stations = useMemo(
    () =>
      TRAM_STOPS.map((f) => {
        const p = green.at(f * green.total)
        return {
          x: p.x + Math.cos(p.angle) * 5.4,
          z: p.z - Math.sin(p.angle) * 5.4,
          angle: p.angle,
        }
      }),
    [green],
  )

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime
    const st = drive.current
    // cap dt so throttled background-tab frames can't teleport the tram
    const step = Math.min(dt, 0.1)
    if (st.dwell > 0) {
      st.dwell -= dt
      st.v = 0
    } else {
      // distance to the next station ahead on the unfolded cycle; g > 0.2
      // skips the platform we just pulled away from
      const cycle = 2 * green.total
      const phase = st.head % cycle
      let gap = Infinity
      for (const s of stationDs) {
        const g = (s - phase + cycle) % cycle
        if (g > 0.2 && g < gap) gap = g
      }
      if (gap <= 0.6) {
        // dock at the platform and open the doors for a moment
        st.head += gap
        st.dwell = TRAM_DWELL
        st.v = 0
      } else {
        // brake into the platform, pull away smoothly after the stop.
        // The advance clamp lands inside the dock window, never past it.
        const target = TRAM_SPEED * Math.min(1, 0.12 + (gap - 0.6) / 20)
        st.v = THREE.MathUtils.damp(st.v, target, 3.2, step)
        st.head += Math.min(st.v * step, gap - 0.3)
      }
    }
    const segs = [g1.current, g2.current, g3.current]
    segs.forEach((seg, i) => {
      if (!seg) return
      const { d, flip } = pingPong(st.head - i * 5.4, green.total)
      const p = green.at(Math.max(0, d))
      seg.position.set(p.x + Math.cos(p.angle) * 2.2, 1.3, p.z - Math.sin(p.angle) * 2.2)
      seg.rotation.y = p.angle + flip
      if (i === 0) {
        rideStates.tram.pos.copy(seg.position)
        rideStates.tram.dir.set(Math.sin(p.angle + flip), 0, Math.cos(p.angle + flip))
      }
    })
    if (b1.current) {
      const { d, flip } = pingPong(t * 7, blue.total)
      const p = blue.at(d)
      b1.current.position.set(p.x + 2, 1.2, p.z)
      b1.current.rotation.y = p.angle + flip
    }
  })

  return (
    <group>
      <TramCar color="#3f9e63" refObj={g1} />
      <TramCar color="#3f9e63" refObj={g2} />
      <TramCar color="#3f9e63" refObj={g3} />
      <TramCar color="#2f6bb0" refObj={b1} />
      {stations.map((s, i) => (
        <group key={i} position={[s.x, 0, s.z]} rotation-y={s.angle}>
          {/* platform slab */}
          <mesh position={[0, 0.25, 0]}>
            <boxGeometry args={[2.4, 0.5, 10]} />
            <meshLambertMaterial color="#ddd2c3" />
          </mesh>
          {/* canopy on two posts */}
          {[-3.2, 3.2].map((z) => (
            <mesh key={z} position={[0.7, 1.9, z]}>
              <boxGeometry args={[0.18, 3.3, 0.18]} />
              <meshLambertMaterial color="#5a5e66" />
            </mesh>
          ))}
          <mesh position={[0.45, 3.6, 0]}>
            <boxGeometry args={[2, 0.16, 8.4]} />
            <meshLambertMaterial color="#0056b5" />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// ---------------------------------------------------------------- plane
function FlyingPlane() {
  const ref = useRef<THREE.Group>(null)
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        [
          [-320, 1, 162], [-420, 1.4, 184], [-495, 7, 201], [-560, 42, 235],
          [-590, 72, 300], [-450, 88, 360], [-240, 88, 392], [-40, 76, 380],
          [80, 56, 340], [60, 30, 280], [-120, 12, 228], [-250, 3, 186], [-292, 1.2, 170],
        ].map(([x, y, z]) => new THREE.Vector3(x, y, z)),
        true,
        'catmullrom',
        0.15,
      ),
    [],
  )
  const next = useMemo(() => new THREE.Vector3(), [])
  useFrame(({ clock }) => {
    const g = ref.current
    if (!g) return
    const t = (clock.elapsedTime / 48) % 1
    curve.getPointAt(t, g.position)
    curve.getPointAt((t + 0.004) % 1, next)
    g.lookAt(next)
  })
  return (
    <group ref={ref}>
      <PlaneModel scale={1.05} />
    </group>
  )
}

// ---------------------------------------------------------------- boats
function Boats() {
  const refs = useRef<Array<THREE.Group | null>>([])
  const boats = useMemo(() => {
    const rng = mulberry32(31)
    return Array.from({ length: 5 }, (_, i) => ({
      cx: -180 + i * 120 + rng() * 40,
      cz: 270 + rng() * 70,
      r: 18 + rng() * 26,
      v: (0.05 + rng() * 0.05) * (i % 2 ? 1 : -1),
      phase: rng() * Math.PI * 2,
      sail: ['#f2f2f2', '#f4e0c4', '#dce8f0'][i % 3],
    }))
  }, [])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    boats.forEach((b, i) => {
      const g = refs.current[i]
      if (!g) return
      const a = b.phase + t * b.v
      g.position.set(b.cx + Math.cos(a) * b.r, 0.2 + Math.sin(t * 1.6 + b.phase) * 0.25, b.cz + Math.sin(a) * b.r)
      g.rotation.y = -a + (b.v > 0 ? 0 : Math.PI)
      g.rotation.z = Math.sin(t * 1.3 + b.phase) * 0.06
    })
  })
  return (
    <group>
      {boats.map((b, i) => (
        <group key={i} ref={(el) => (refs.current[i] = el)}>
          <mesh position={[0, 0.4, 0]}>
            <boxGeometry args={[1.6, 0.9, 4.6]} />
            <meshLambertMaterial color="#f4f0e6" />
          </mesh>
          <mesh position={[0, 3, -0.3]} rotation-y={Math.PI}>
            <coneGeometry args={[1.7, 4.6, 3]} />
            <meshLambertMaterial color={b.sail} flatShading />
          </mesh>
        </group>
      ))}
    </group>
  )
}

export default function Movers() {
  return (
    <group>
      <Cars />
      <Trams />
      <FlyingPlane />
      <Boats />
    </group>
  )
}
