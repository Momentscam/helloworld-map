import * as THREE from 'three'
import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { glassTexture, ledTexture, mosaicTexture, stripeTexture } from './textures'
import { windowGlowAt } from './lighting'
import { useTour } from './store'
import { rideStates } from './rideState'

const L = (color: string, flat = false) => <meshLambertMaterial color={color} flatShading={flat} />

// ---------------------------------------------------------------- stop 01
function CasaBatllo() {
  const facadeMats = useMemo(() => {
    const mosaic = new THREE.MeshLambertMaterial({ map: mosaicTexture() })
    const plain = new THREE.MeshLambertMaterial({ color: '#cbd8de' })
    return [mosaic, mosaic, plain, plain, mosaic, mosaic]
  }, [])
  return (
    <group position={[-11, 0, -33]}>
      <mesh position={[0, 9, 0]} material={facadeMats}>
        <boxGeometry args={[13, 18, 12]} />
      </mesh>
      {/* dragon-back roof with spine */}
      <mesh position={[0.5, 18.6, 0]} rotation-x={Math.PI / 2} rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[3.6, 3.6, 11.5, 12, 1, false, 0, Math.PI]} />
        {L('#b0623a', true)}
      </mesh>
      {[-4.4, -2.2, 0, 2.2, 4.4].map((z, i) => (
        <mesh key={i} position={[0.5, 21.9 + Math.sin(i * 1.4) * 0.3, z]}>
          <sphereGeometry args={[0.75, 6, 5]} />
          {L(i % 2 ? '#7fa869' : '#c9873f', true)}
        </mesh>
      ))}
      {/* turret + cross */}
      <mesh position={[4.6, 20.6, 4.2]}>
        <cylinderGeometry args={[0.85, 1.1, 6.5, 8]} />
        {L('#e8ddc9')}
      </mesh>
      <mesh position={[4.6, 24.4, 4.2]}>
        <sphereGeometry args={[1.15, 8, 6]} />
        {L('#9fb8c9')}
      </mesh>
      <mesh position={[4.6, 26.1, 4.2]}>
        <boxGeometry args={[0.35, 2, 0.35]} />
        {L('#e3c04d')}
      </mesh>
      <mesh position={[4.6, 26.3, 4.2]}>
        <boxGeometry args={[1.2, 0.3, 0.3]} />
        {L('#e3c04d')}
      </mesh>
      {/* chimney cluster */}
      {[[-3.5, 3.2], [-4.6, 1.8], [-3, 1.4]].map(([x, z], i) => (
        <group key={i} position={[x, 19.5, z]}>
          <mesh>
            <cylinderGeometry args={[0.45, 0.6, 3.2, 6]} />
            {L('#d9c9b2', true)}
          </mesh>
          <mesh position={[0, 1.9, 0]}>
            <sphereGeometry args={[0.65, 6, 5]} />
            {L('#b48fd9', true)}
          </mesh>
        </group>
      ))}
      {/* bone balconies + windows on the street facade */}
      {[0, 1, 2].map((r) =>
        [-1, 0, 1].map((c) => (
          <group key={`${r}${c}`} position={[6.6, 5 + r * 4.4, c * 3.7]}>
            <mesh position={[-0.3, 1.6, 0]}>
              <boxGeometry args={[0.5, 2, 2.4]} />
              {L('#2a333c')}
            </mesh>
            <mesh position={[0.35, 0, 0]} rotation-z={-Math.PI / 2}>
              <sphereGeometry args={[1.35, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
              {L('#f4efe4', true)}
            </mesh>
          </group>
        )),
      )}
      {/* skeletal bone columns over the ground floor */}
      {[-4.5, -1.5, 1.5, 4.5].map((z, i) => (
        <mesh key={i} position={[6.6, 1.6, z]}>
          <cylinderGeometry args={[0.5, 0.75, 3.2, 6]} />
          {L('#efe8d8', true)}
        </mesh>
      ))}
      <mesh position={[6.7, 3.4, 0]}>
        <boxGeometry args={[0.4, 0.9, 11]} />
        {L('#efe8d8')}
      </mesh>
    </group>
  )
}

// ---------------------------------------------------------------- stop 02
function TibidaboTemple() {
  return (
    <group position={[-95, 115, -260]}>
      {/* stone crypt with arched band */}
      <mesh position={[0, 3, 0]}>
        <cylinderGeometry args={[9, 10.5, 6, 8]} />
        {L('#cbb9a2', true)}
      </mesh>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
        const a = (i / 8) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a) * 8.6, 3.4, Math.sin(a) * 8.6]} rotation-y={-a + Math.PI / 2}>
            <boxGeometry args={[1.6, 2.6, 0.5]} />
            {L('#4a4438')}
          </mesh>
        )
      })}
      {/* grey neo-gothic upper church */}
      <mesh position={[0, 10, 0]}>
        <cylinderGeometry args={[6, 6.5, 9, 8]} />
        {L('#b9bcc4', true)}
      </mesh>
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4
        return (
          <group key={i} position={[Math.cos(a) * 6.4, 12, Math.sin(a) * 6.4]}>
            <mesh>
              <cylinderGeometry args={[1.2, 1.2, 9, 6]} />
              {L('#a9adb8', true)}
            </mesh>
            <mesh position={[0, 5.6, 0]}>
              <coneGeometry args={[1.4, 2.6, 6]} />
              {L('#8e93a1', true)}
            </mesh>
          </group>
        )
      })}
      {/* tall lancet windows */}
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(a) * 6, 10.5, Math.sin(a) * 6]} rotation-y={-a + Math.PI / 2}>
            <boxGeometry args={[1.4, 4.6, 0.5]} />
            {L('#39434e')}
          </mesh>
        )
      })}
      <mesh position={[0, 16.6, 0]}>
        <cylinderGeometry args={[3.1, 3.6, 4, 8]} />
        {L('#a9adb8', true)}
      </mesh>
      {/* the golden Sagrat Cor, arms open */}
      <mesh position={[0, 20.2, 0]}>
        <cylinderGeometry args={[0.5, 0.75, 3, 6]} />
        {L('#e3c04d')}
      </mesh>
      <mesh position={[0, 20.9, 0]} rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[0.22, 0.22, 3.2, 5]} />
        {L('#e3c04d')}
      </mesh>
      <mesh position={[0, 22.1, 0]}>
        <sphereGeometry args={[0.62, 8, 6]} />
        {L('#e3c04d')}
      </mesh>
    </group>
  )
}

function FerrisWheel({ position, rotationY = 0 }: { position: [number, number, number]; rotationY?: number }) {
  const wheel = useRef<THREE.Group>(null)
  const colors = ['#d94f3d', '#e8b93c', '#3d76c9', '#4aa46a', '#e07a2f', '#a855f7', '#f2f2f2', '#18c7d8']
  useFrame((_, dt) => {
    const w = wheel.current
    if (!w) return
    w.rotation.z += dt * 0.22
    w.children.forEach((child) => {
      if (child.name === 'gondola') child.rotation.z = -w.rotation.z
    })
  })
  return (
    <group position={position} rotation-y={rotationY}>
      <mesh position={[-2.4, 4, 0]} rotation-z={0.42}>
        <boxGeometry args={[0.8, 10, 0.8]} />
        {L('#c2453a')}
      </mesh>
      <mesh position={[2.4, 4, 0]} rotation-z={-0.42}>
        <boxGeometry args={[0.8, 10, 0.8]} />
        {L('#c2453a')}
      </mesh>
      <group ref={wheel} position={[0, 8.6, 0]}>
        <mesh>
          <torusGeometry args={[7.5, 0.28, 6, 24]} />
          {L('#d94f3d')}
        </mesh>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} rotation-z={(i / 4) * Math.PI}>
            <boxGeometry args={[0.35, 15, 0.35]} />
            {L('#e0776b')}
          </mesh>
        ))}
        {colors.map((c, i) => {
          const a = (i / colors.length) * Math.PI * 2
          return (
            <group key={i} name="gondola" position={[Math.cos(a) * 7.5, Math.sin(a) * 7.5, 0]}>
              <mesh position={[0, -1, 0]}>
                <boxGeometry args={[1.6, 1.6, 1.6]} />
                {L(c)}
              </mesh>
            </group>
          )
        })}
      </group>
    </group>
  )
}

function Carousel({ position }: { position: [number, number, number] }) {
  const spin = useRef<THREE.Group>(null)
  useFrame((_, dt) => {
    if (spin.current) spin.current.rotation.y += dt * 0.6
  })
  const horses = ['#d94f3d', '#3d76c9', '#e8b93c', '#4aa46a', '#a855f7', '#f2f2f2']
  return (
    <group position={position}>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[4.2, 4.4, 0.6, 10]} />
        {L('#c9bda4')}
      </mesh>
      <mesh position={[0, 2.4, 0]}>
        <cylinderGeometry args={[0.35, 0.35, 4.2, 6]} />
        {L('#8d5b3f')}
      </mesh>
      <group ref={spin}>
        {horses.map((c, i) => {
          const a = (i / horses.length) * Math.PI * 2
          return (
            <group key={i} position={[Math.cos(a) * 3, 1.6, Math.sin(a) * 3]} rotation-y={-a}>
              <mesh>
                <boxGeometry args={[0.55, 0.7, 1.3]} />
                {L(c)}
              </mesh>
              <mesh position={[0, 1.3, 0]}>
                <cylinderGeometry args={[0.07, 0.07, 2, 4]} />
                {L('#e3c04d')}
              </mesh>
            </group>
          )
        })}
      </group>
      <mesh position={[0, 4.9, 0]}>
        <coneGeometry args={[4.6, 1.9, 10]} />
        {L('#d94f3d', true)}
      </mesh>
      <mesh position={[0, 6, 0]}>
        <sphereGeometry args={[0.4, 6, 5]} />
        {L('#e3c04d')}
      </mesh>
    </group>
  )
}

/** Tibidabo's iconic red Avió — a little plane circling its mast since 1928 */
function AvioRide({ position }: { position: [number, number, number] }) {
  const arm = useRef<THREE.Group>(null)
  useFrame((_, dt) => {
    const a = arm.current
    if (!a) return
    a.rotation.y += dt * 0.5
    // broadcast the cockpit pose for "ride the plane": seat ahead of the wing,
    // facing the direction of flight — the panorama sweeps as the plane circles
    const th = a.rotation.y
    const tx = -Math.sin(th)
    const tz = -Math.cos(th)
    rideStates.plane.pos.set(
      position[0] + 5.6 * Math.cos(th) + tx * 1.6,
      position[1] + 7.6 - 0.55,
      position[2] - 5.6 * Math.sin(th) + tz * 1.6,
    )
    rideStates.plane.dir.set(tx, 0, tz)
  })
  return (
    <group position={position}>
      <mesh position={[0, 4, 0]}>
        <cylinderGeometry args={[0.4, 0.6, 8, 6]} />
        {L('#8f99a8')}
      </mesh>
      <group ref={arm} position={[0, 7.6, 0]}>
        <mesh position={[2.9, 0, 0]}>
          <boxGeometry args={[5.8, 0.22, 0.22]} />
          {L('#5a5e66')}
        </mesh>
        {/* the red plane — nose into the direction of flight */}
        <group position={[5.6, -1.1, 0]} rotation-y={Math.PI / 2}>
          <mesh rotation-z={Math.PI / 2}>
            <cylinderGeometry args={[0.42, 0.5, 3, 8]} />
            {L('#c2453a')}
          </mesh>
          <mesh position={[0.3, 0.1, 0]}>
            <boxGeometry args={[1.1, 0.12, 4.4]} />
            {L('#d94f3d')}
          </mesh>
          <mesh position={[-1.5, 0.4, 0]}>
            <boxGeometry args={[0.7, 0.8, 0.12]} />
            {L('#d94f3d')}
          </mesh>
          <mesh position={[0, -0.9, 0]}>
            <boxGeometry args={[0.1, 1.6, 0.1]} />
            {L('#5a5e66')}
          </mesh>
        </group>
      </group>
    </group>
  )
}

function DropTower({ position }: { position: [number, number, number] }) {
  const car = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (!car.current) return
    // slow climb, brief hold, fast drop
    const t = clock.elapsedTime % 6
    const y = t < 4 ? (t / 4) * 9 : t < 4.6 ? 9 : 9 * (1 - (t - 4.6) / 1.4) ** 2
    car.current.position.y = 1.6 + y
  })
  return (
    <group position={position}>
      <mesh position={[0, 7, 0]}>
        <boxGeometry args={[0.9, 14, 0.9]} />
        {L('#9aa3ad')}
      </mesh>
      <mesh position={[0, 14.3, 0]}>
        <sphereGeometry args={[0.7, 6, 5]} />
        {L('#d94f3d')}
      </mesh>
      <group ref={car}>
        <mesh>
          <boxGeometry args={[3.1, 0.9, 3.1]} />
          {L('#e8b93c')}
        </mesh>
        {[[-1.2, -1.2], [1.2, -1.2], [-1.2, 1.2], [1.2, 1.2]].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.75, z]}>
            <boxGeometry args={[0.6, 0.6, 0.6]} />
            {L('#3d76c9')}
          </mesh>
        ))}
      </group>
    </group>
  )
}

/** the summit terrace: temple on its pedestal, rides around it */
function TibidaboPark() {
  const TERRACE = 108.6
  return (
    <group>
      <FerrisWheel position={[-79, TERRACE, -249]} rotationY={0.7} />
      <Carousel position={[-114, TERRACE, -247]} />
      <AvioRide position={[-76, TERRACE, -274]} />
      <DropTower position={[-114, TERRACE, -272]} />
      {/* ticket booth */}
      <group position={[-95, TERRACE, -236]}>
        <mesh position={[0, 1.1, 0]}>
          <boxGeometry args={[2.6, 2.2, 2]} />
          {L('#f2ead6')}
        </mesh>
        <mesh position={[0, 2.6, 0]}>
          <coneGeometry args={[2, 1, 4]} />
          {L('#d94f3d', true)}
        </mesh>
      </group>
    </group>
  )
}

// ---------------------------------------------------------------- stop 03
function Boqueria() {
  const stalls = [
    { c: '#d94f3d', a: '#c94a3d' },
    { c: '#e8b93c', a: '#3d76c9' },
    { c: '#4aa46a', a: '#c94a3d' },
    { c: '#3d76c9', a: '#4aa46a' },
    { c: '#e07a2f', a: '#3d76c9' },
    { c: '#a855f7', a: '#c94a3d' },
  ]
  const fruit = ['#e8402f', '#ffb52e', '#7fc94a', '#ff7b2e', '#e84b8f', '#ffe14a']
  return (
    <group position={[58, 0, 80]}>
      <mesh position={[0, 2.6, -2]}>
        <boxGeometry args={[20, 5.2, 13]} />
        {L('#ded4c2')}
      </mesh>
      {[-6.5, 0, 6.5].map((x, i) => (
        <mesh key={i} position={[x, 6, -2]} rotation-z={Math.PI / 4}>
          <boxGeometry args={[4.8, 4.8, 12.6]} />
          {L(i === 1 ? '#9aa3ad' : '#8b939d', true)}
        </mesh>
      ))}
      {/* stained-glass fan + iron rim */}
      {[
        { r: 5, c: '#3d76c9' },
        { r: 4, c: '#d94f3d' },
        { r: 3, c: '#e8b93c' },
      ].map(({ r, c }, i) => (
        <mesh key={i} position={[0, 5.2, 4.6 + i * 0.25]}>
          <circleGeometry args={[r, 16, 0, Math.PI]} />
          <meshLambertMaterial color={c} side={THREE.DoubleSide} />
        </mesh>
      ))}
      <mesh position={[0, 5.2, 4.5]} rotation-x={Math.PI / 2}>
        <torusGeometry args={[5.1, 0.22, 6, 18, Math.PI]} />
        {L('#3a4048')}
      </mesh>
      {/* market stalls with striped awnings and produce */}
      {stalls.map(({ c, a }, i) => {
        const x = -7.5 + (i % 3) * 3.2
        const z = 7.5 + Math.floor(i / 3) * 3.4
        return (
          <group key={i} position={[x, 0, z]}>
            <mesh position={[0, 0.9, 0]}>
              <boxGeometry args={[2.4, 1.8, 2]} />
              {L(c)}
            </mesh>
            <mesh position={[0, 2.35, 0.35]} rotation-x={-0.4}>
              <planeGeometry args={[2.7, 1.6]} />
              <meshLambertMaterial map={stripeTexture(a)} side={THREE.DoubleSide} />
            </mesh>
            {[0, 1, 2].map((k) => (
              <mesh key={k} position={[-0.7 + k * 0.7, 1.95, 0.55]}>
                <sphereGeometry args={[0.28, 6, 5]} />
                {L(fruit[(i + k) % fruit.length], true)}
              </mesh>
            ))}
          </group>
        )
      })}
    </group>
  )
}

// ---------------------------------------------------------------- stop 04
export function PlaneModel({ scale = 1 }: { scale?: number }) {
  return (
    <group scale={scale}>
      <mesh rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[1.3, 1.5, 11, 10]} />
        {L('#f4f6f8')}
      </mesh>
      <mesh position={[0, 0, 6]}>
        <sphereGeometry args={[1.32, 10, 8]} />
        {L('#f4f6f8')}
      </mesh>
      {/* cockpit windows */}
      <mesh position={[0, 0.45, 6.4]}>
        <boxGeometry args={[1.6, 0.55, 0.9]} />
        {L('#2b3947')}
      </mesh>
      <mesh position={[0, 0.2, 0.5]}>
        <boxGeometry args={[15, 0.35, 2.6]} />
        {L('#dfe5ea')}
      </mesh>
      {/* engines */}
      {[-3.4, 3.4].map((x) => (
        <mesh key={x} position={[x, -0.5, 1.2]} rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[0.55, 0.55, 1.8, 8]} />
          {L('#9aa8b4')}
        </mesh>
      ))}
      <mesh position={[0, 1.6, -5]}>
        <boxGeometry args={[0.35, 3.2, 2]} />
        {L('#d94f3d')}
      </mesh>
      <mesh position={[0, 0.4, -5]}>
        <boxGeometry args={[5.5, 0.3, 1.6]} />
        {L('#dfe5ea')}
      </mesh>
    </group>
  )
}

function Radar() {
  const ref = useRef<THREE.Mesh>(null)
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 1.8
  })
  return (
    <mesh ref={ref} position={[42, 17.6, -12]}>
      <boxGeometry args={[4.6, 0.3, 0.5]} />
      {L('#e5e1d4')}
    </mesh>
  )
}

function Airport() {
  const dashes = useMemo(() => Array.from({ length: 11 }, (_, i) => -75 + i * 15), [])
  const glassMats = useMemo(() => {
    const glass = new THREE.MeshLambertMaterial({ map: glassTexture(), color: '#cfe2ec' })
    const roofM = new THREE.MeshLambertMaterial({ color: '#f4f2ec' })
    return [glass, glass, roofM, roofM, glass, glass]
  }, [])
  return (
    <group position={[-400, 0, 185]} rotation-y={-0.22}>
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[190, 0.4, 72]} />
        {L('#d8d5cb')}
      </mesh>
      <mesh position={[0, 0.45, 24]}>
        <boxGeometry args={[175, 0.25, 8]} />
        {L('#5a5e66')}
      </mesh>
      {dashes.map((x) => (
        <mesh key={x} position={[x, 0.62, 24]}>
          <boxGeometry args={[6, 0.1, 0.7]} />
          {L('#f2f2f2')}
        </mesh>
      ))}
      {[-55, 0, 55].map((x) => (
        <mesh key={x} position={[x, 0.5, 2]}>
          <boxGeometry args={[1.4, 0.08, 36]} />
          {L('#e3c04d')}
        </mesh>
      ))}
      {/* terminal T1 with glass curtain wall + wave roof */}
      <mesh position={[0, 3.5, -20]} material={glassMats}>
        <boxGeometry args={[62, 7, 13]} />
      </mesh>
      <mesh position={[0, 7.6, -20]} rotation-z={Math.PI / 2} rotation-y={Math.PI / 2}>
        <cylinderGeometry args={[8.2, 8.2, 64, 12, 1, false, Math.PI / 2 + 0.9, 1.35]} />
        {L('#f4f2ec', true)}
      </mesh>
      {[-20, 0, 20].map((x) => (
        <mesh key={x} position={[x, 2, -11]} rotation-y={0.3}>
          <boxGeometry args={[1.8, 2.2, 8]} />
          {L('#e5e1d4')}
        </mesh>
      ))}
      <mesh position={[42, 7.5, -12]}>
        <cylinderGeometry args={[1.6, 2, 15, 8]} />
        {L('#e5e1d4')}
      </mesh>
      <mesh position={[42, 16, -12]}>
        <cylinderGeometry args={[3.6, 3.6, 2.4, 8]} />
        {L('#8fb4c6')}
      </mesh>
      <Radar />
      <group position={[-28, 1.4, -4]} rotation-y={2.4}>
        <PlaneModel scale={0.85} />
      </group>
      <group position={[10, 1.4, -3]} rotation-y={2.9}>
        <PlaneModel scale={0.85} />
      </group>
      {[-12, -6, 22, 30].map((x, i) => (
        <mesh key={i} position={[x, 0.9, -6 - (i % 2) * 3]}>
          <boxGeometry args={[2.2, 1, 1.2]} />
          {L(i % 2 ? '#e8b93c' : '#5a5e66')}
        </mesh>
      ))}
    </group>
  )
}

// ---------------------------------------------------------------- stop 05
function Moco() {
  return (
    <group position={[110, 0, 72]}>
      <mesh position={[0, 4.5, 0]}>
        <boxGeometry args={[12, 9, 10]} />
        {L('#e3d3b5')}
      </mesh>
      <mesh position={[0, 9.4, 0]}>
        <boxGeometry args={[13, 0.9, 11]} />
        {L('#c9b691')}
      </mesh>
      {/* gothic arched portal */}
      <mesh position={[0, 2, 5.1]}>
        <boxGeometry args={[3.2, 4, 0.5]} />
        {L('#4c4234')}
      </mesh>
      <mesh position={[0, 4, 5.1]} rotation-x={Math.PI / 2}>
        <cylinderGeometry args={[1.6, 1.6, 0.5, 8, 1, false, 0, Math.PI]} />
        {L('#4c4234')}
      </mesh>
      {/* stone window pairs */}
      {[[-3.6, 6], [3.6, 6], [-3.6, 2.6], [3.6, 2.6]].map(([x, y], i) => (
        <mesh key={i} position={[x, y, 5.05]}>
          <boxGeometry args={[1.6, 2.2, 0.3]} />
          {L('#39434e')}
        </mesh>
      ))}
      {/* old stone, new neon: pink edge-light frame */}
      {[
        { p: [-6.1, 4.5, 5.15], s: [0.28, 9.2, 0.28] },
        { p: [6.1, 4.5, 5.15], s: [0.28, 9.2, 0.28] },
        { p: [0, 9.15, 5.15], s: [12.4, 0.28, 0.28] },
      ].map(({ p, s }, i) => (
        <mesh key={i} position={p as [number, number, number]}>
          <boxGeometry args={s as [number, number, number]} />
          <meshStandardMaterial color="#ff4fd8" emissive="#ff4fd8" emissiveIntensity={1.1} />
        </mesh>
      ))}
      <mesh position={[4.4, 6, 5.4]}>
        <boxGeometry args={[2, 4.8, 0.3]} />
        <meshStandardMaterial color="#ff4fd8" emissive="#ff4fd8" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[-4.6, 8, 5.3]}>
        <boxGeometry args={[1.4, 1.4, 0.3]} />
        <meshStandardMaterial color="#18c7d8" emissive="#18c7d8" emissiveIntensity={0.7} />
      </mesh>
    </group>
  )
}

// ---------------------------------------------------------------- flavor
function SagradaFamilia() {
  const spires: Array<[number, number, number]> = [
    [-7, -14, 34], [0, -15, 40], [7, -14, 34],
    [-7, 14, 34], [0, 15, 40], [7, 14, 34],
  ]
  return (
    <group position={[99, 0, -55]}>
      <mesh position={[0, 7, 0]}>
        <boxGeometry args={[20, 14, 34]} />
        {L('#d9c49a', true)}
      </mesh>
      {/* side aisles */}
      <mesh position={[-11.5, 4, 0]}>
        <boxGeometry args={[4, 8, 28]} />
        {L('#cdb488', true)}
      </mesh>
      <mesh position={[11.5, 4, 0]}>
        <boxGeometry args={[4, 8, 28]} />
        {L('#cdb488', true)}
      </mesh>
      {/* nativity facade: portals + rose window */}
      <mesh position={[0, 10.5, 17.2]}>
        <circleGeometry args={[2.6, 12]} />
        <meshLambertMaterial color="#8f6fae" side={THREE.DoubleSide} />
      </mesh>
      {[-5, 0, 5].map((x, i) => (
        <group key={i} position={[x, 0, 17.2]}>
          <mesh position={[0, 2.2, 0]}>
            <boxGeometry args={[2.6, 4.4, 0.5]} />
            {L('#4a4438')}
          </mesh>
          <mesh position={[0, 4.4, 0]} rotation-x={Math.PI / 2}>
            <cylinderGeometry args={[1.3, 1.3, 0.5, 8, 1, false, 0, Math.PI]} />
            {L('#4a4438')}
          </mesh>
        </group>
      ))}
      {spires.map(([x, z, h], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, h / 2, 0]}>
            <coneGeometry args={[2.6, h, 7]} />
            {L('#cdb488', true)}
          </mesh>
          {/* spire openings */}
          <mesh position={[0, h * 0.62, 1.35]}>
            <boxGeometry args={[0.9, h * 0.3, 0.7]} />
            {L('#6b5d49')}
          </mesh>
          <mesh position={[0, h + 1.4, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 2.8, 5]} />
            {L('#cdb488')}
          </mesh>
          <mesh position={[0, h + 2.8, 0]}>
            <sphereGeometry args={[0.9, 6, 5]} />
            {L(i % 2 ? '#d94f3d' : '#e3c04d', true)}
          </mesh>
        </group>
      ))}
      <mesh position={[0, 23, 0]}>
        <coneGeometry args={[3.2, 46, 7]} />
        {L('#d9c49a', true)}
      </mesh>
      <mesh position={[0, 47.5, 0]}>
        <boxGeometry args={[0.5, 3, 0.5]} />
        {L('#e3c04d')}
      </mesh>
      <mesh position={[0, 48, 0]}>
        <boxGeometry args={[1.8, 0.4, 0.4]} />
        {L('#e3c04d')}
      </mesh>
      {/* the eternal crane */}
      <group position={[13, 0, 8]}>
        <mesh position={[0, 24, 0]}>
          <boxGeometry args={[1, 48, 1]} />
          {L('#e8b93c')}
        </mesh>
        <mesh position={[6, 47, 0]}>
          <boxGeometry args={[16, 0.9, 0.9]} />
          {L('#e8b93c')}
        </mesh>
        <mesh position={[13, 43, 0]}>
          <boxGeometry args={[0.25, 7, 0.25]} />
          {L('#5a5e66')}
        </mesh>
      </group>
    </group>
  )
}

/** Casa Milà — undulating limestone floors, dark iron-balcony bands, warrior chimneys */
function LaPedrera() {
  const chimneys: Array<[number, number]> = [[-3.6, -2.6], [-1, -3.4], [2.2, -2.2], [4, 0.6]]
  return (
    <group position={[11, 0, -77]}>
      {[0, 1, 2, 3, 4].map((i) => (
        <group key={i} position={[0, 1.3 + i * 2.9, 0]}>
          <mesh scale={[1.18, 1, 0.95]} rotation-y={i % 2 ? 0.32 : 0}>
            <cylinderGeometry args={[i % 2 ? 7.5 : 7.1, i % 2 ? 7.1 : 7.5, 2, 10]} />
            {L('#d8cdbb', true)}
          </mesh>
          {/* recessed window band with wrought-iron rail */}
          <mesh position={[0, 1.45, 0]} scale={[1.18, 1, 0.95]}>
            <cylinderGeometry args={[6.7, 6.7, 0.9, 10]} />
            {L('#2f3843')}
          </mesh>
        </group>
      ))}
      {/* roof terrace */}
      <mesh position={[0, 15.1, 0]} scale={[1.18, 1, 0.95]}>
        <cylinderGeometry args={[7.3, 7.5, 0.9, 10]} />
        {L('#cfc3ad', true)}
      </mesh>
      {/* espanta-bruixes chimney sentinels */}
      {chimneys.map(([x, z], i) => (
        <group key={i} position={[x, 15.5, z]}>
          <mesh position={[0, 0.9, 0]} rotation-y={i}>
            <cylinderGeometry args={[0.5, 0.72, 1.8, 5]} />
            {L('#cfc4b0', true)}
          </mesh>
          <mesh position={[0, 2.2, 0]} rotation-z={0.25} rotation-y={i * 1.4}>
            <coneGeometry args={[0.55, 1.3, 4]} />
            {L('#bfb29a', true)}
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** construction tower crane — mast, jib, counter-jib, hook line */
function TowerCrane({
  position,
  height,
  jib,
  rotY,
}: {
  position: [number, number, number]
  height: number
  jib: number
  rotY: number
}) {
  return (
    <group position={position} rotation-y={rotY}>
      <mesh position={[0, height / 2, 0]}>
        <boxGeometry args={[0.8, height, 0.8]} />
        {L('#e8b93c')}
      </mesh>
      <group position={[0, height, 0]}>
        <mesh position={[jib / 2 - 1, 0, 0]}>
          <boxGeometry args={[jib + 2.5, 0.45, 0.45]} />
          {L('#e8b93c')}
        </mesh>
        {/* counter-weight */}
        <mesh position={[-3.2, -0.7, 0]}>
          <boxGeometry args={[1.2, 1, 1]} />
          {L('#8f99a8')}
        </mesh>
        {/* apex + tie bars */}
        <mesh position={[0, 1.4, 0]}>
          <coneGeometry args={[0.7, 2, 4]} />
          {L('#d9a92c', true)}
        </mesh>
        {/* hook line */}
        <mesh position={[jib * 0.7, -2.4, 0]}>
          <boxGeometry args={[0.12, 4.8, 0.12]} />
          {L('#5a5e66')}
        </mesh>
        <mesh position={[jib * 0.7, -4.9, 0]}>
          <boxGeometry args={[0.7, 0.5, 0.7]} />
          {L('#c2453a')}
        </mesh>
      </group>
    </group>
  )
}

/** Camp Nou mid-renovation: open garnet bowl, teal rim, bare concrete, cranes */
function CampNou() {
  const STRETCH = 1.5
  const craneSpots: Array<[number, number, number, number]> = [
    // angle, distance, height, jib rotation
    [0.45, 20, 17, 2.4], [1.55, 19, 15, -0.6], [2.6, 21, 18, 1.2],
    [3.7, 20, 14, 3.6], [4.8, 19, 16, 0.4], [5.8, 21, 15, -1.8],
  ]
  return (
    <group position={[-210, 0, -35]} rotation-y={0.15}>
      <group scale={[STRETCH, 1, 1]}>
        {/* exposed concrete colonnade (renovation state) */}
        <mesh position={[0, 2.2, 0]}>
          <cylinderGeometry args={[16.6, 17.4, 4.4, 20, 1, true]} />
          <meshLambertMaterial color="#c6c1b4" side={THREE.DoubleSide} flatShading />
        </mesh>
        {/* dark open bays between pillars */}
        <mesh position={[0, 1.9, 0]}>
          <cylinderGeometry args={[16.2, 16.9, 2.6, 40, 1, true]} />
          <meshLambertMaterial color="#3c3f45" side={THREE.BackSide} />
        </mesh>
        {/* lower seating tier */}
        <mesh position={[0, 3.4, 0]}>
          <cylinderGeometry args={[15.4, 9.6, 4.4, 20, 1, true]} />
          <meshLambertMaterial color="#8c2b3d" side={THREE.DoubleSide} flatShading />
        </mesh>
        {/* walkway ring */}
        <mesh position={[0, 5.7, 0]}>
          <cylinderGeometry args={[15.9, 15.4, 0.6, 20, 1, true]} />
          <meshLambertMaterial color="#d8d3c6" side={THREE.DoubleSide} />
        </mesh>
        {/* upper seating tier */}
        <mesh position={[0, 7.2, 0]}>
          <cylinderGeometry args={[17.6, 15.9, 2.6, 20, 1, true]} />
          <meshLambertMaterial color="#7a2436" side={THREE.DoubleSide} flatShading />
        </mesh>
        {/* teal construction band around the crown */}
        <mesh position={[0, 8.9, 0]}>
          <cylinderGeometry args={[17.7, 17.7, 1, 20, 1, true]} />
          <meshLambertMaterial color="#57c4d4" side={THREE.DoubleSide} />
        </mesh>
        {/* pitch */}
        <mesh position={[0, 0.45, 0]} rotation-x={-Math.PI / 2}>
          <circleGeometry args={[9.2, 20]} />
          <meshLambertMaterial color="#4f9e4f" side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.55, 0]} rotation-x={-Math.PI / 2}>
          <ringGeometry args={[2.2, 2.7, 14]} />
          <meshLambertMaterial color="#e8f0e8" side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.52, 0]}>
          <boxGeometry args={[0.45, 0.05, 17]} />
          <meshLambertMaterial color="#e8f0e8" />
        </mesh>
        {/* club crest patch on the seats */}
        <mesh position={[0, 4.2, -12.2]} rotation-x={0.65}>
          <circleGeometry args={[1.7, 8]} />
          <meshLambertMaterial color="#e3c04d" side={THREE.DoubleSide} />
        </mesh>
      </group>
      {/* renovation cranes ringing the bowl */}
      {craneSpots.map(([a, r, h, jr], i) => (
        <TowerCrane
          key={i}
          position={[Math.cos(a) * r * STRETCH, 0, Math.sin(a) * r]}
          height={h}
          jib={9}
          rotY={jr}
        />
      ))}
      {/* site clutter: portacabins + material stacks */}
      {[[-30, 8, '#f2f2f2'], [-27, 11, '#f2f2f2'], [28, -12, '#3d76c9'], [31, -9, '#c2453a']].map(
        ([x, z, c], i) => (
          <mesh key={i} position={[x as number, 0.9, z as number]} rotation-y={i * 0.5}>
            <boxGeometry args={[3, 1.6, 1.6]} />
            {L(c as string)}
          </mesh>
        ),
      )}
    </group>
  )
}

/** RCDE Stadium: rectangular, four white truss canopies with open corners */
function RCDEStadium() {
  const roofs: Array<{ pos: [number, number, number]; size: [number, number, number]; tilt: number }> = [
    { pos: [0, 10.6, -11.5], size: [30, 0.7, 8.5], tilt: 0.1 },
    { pos: [0, 10.6, 11.5], size: [30, 0.7, 8.5], tilt: -0.1 },
    { pos: [-15.5, 10.2, 0], size: [7.5, 0.7, 16], tilt: 0.1 },
    { pos: [15.5, 10.2, 0], size: [7.5, 0.7, 16], tilt: -0.1 },
  ]
  return (
    <group position={[-300, 0, 60]} rotation-y={-0.35}>
      {/* plaza */}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[46, 0.3, 38]} />
        {L('#cfcabd')}
      </mesh>
      {/* blue-grey panelled base */}
      <mesh position={[0, 2.4, 0]}>
        <boxGeometry args={[37, 4.8, 29]} />
        {L('#3d4c5e', true)}
      </mesh>
      {/* light panel stripes */}
      {[-13, -6.5, 0, 6.5, 13].map((x) => (
        <mesh key={x} position={[x, 2.4, 0]}>
          <boxGeometry args={[2.2, 3.6, 29.4]} />
          {L('#5c7290')}
        </mesh>
      ))}
      {/* seating bowl */}
      {[
        { pos: [0, 5.8, -9.5] as [number, number, number], size: [28, 0.8, 8] as [number, number, number], rx: 0.42 },
        { pos: [0, 5.8, 9.5] as [number, number, number], size: [28, 0.8, 8] as [number, number, number], rx: -0.42 },
      ].map((s, i) => (
        <mesh key={i} position={s.pos} rotation-x={s.rx}>
          <boxGeometry args={s.size} />
          {L(i ? '#2a5fa8' : '#2a5fa8', true)}
        </mesh>
      ))}
      {[
        { pos: [-13.5, 5.8, 0] as [number, number, number], rz: -0.42 },
        { pos: [13.5, 5.8, 0] as [number, number, number], rz: 0.42 },
      ].map((s, i) => (
        <mesh key={i} position={s.pos} rotation-z={s.rz}>
          <boxGeometry args={[8, 0.8, 16]} />
          {L('#2a5fa8', true)}
        </mesh>
      ))}
      {/* white seat lettering block on the home end */}
      <mesh position={[0, 6.4, -10.8]} rotation-x={0.42}>
        <boxGeometry args={[10, 0.15, 2.2]} />
        {L('#eef0f2')}
      </mesh>
      {/* pitch */}
      <mesh position={[0, 4.88, 0]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[21, 13.5]} />
        <meshLambertMaterial color="#4f9e4f" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 4.95, 0]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[1.7, 2.1, 14]} />
        <meshLambertMaterial color="#e8f0e8" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 4.92, 0]}>
        <boxGeometry args={[0.35, 0.05, 13.5]} />
        <meshLambertMaterial color="#e8f0e8" />
      </mesh>
      {/* four canopies with open corners, on white truss edges + columns */}
      {roofs.map((r, i) => (
        <group key={i}>
          <mesh position={r.pos} rotation-x={i < 2 ? r.tilt : 0} rotation-z={i >= 2 ? r.tilt : 0}>
            <boxGeometry args={r.size} />
            {L('#e9e7e0')}
          </mesh>
          {/* truss line under the inner roof edge */}
          <mesh
            position={[
              r.pos[0] + (i === 2 ? 3 : i === 3 ? -3 : 0),
              r.pos[1] - 0.7,
              r.pos[2] + (i === 0 ? 3.4 : i === 1 ? -3.4 : 0),
            ]}
          >
            <boxGeometry args={i < 2 ? [29, 0.5, 0.5] : [0.5, 0.5, 15]} />
            {L('#f4f4f0')}
          </mesh>
        </group>
      ))}
      {/* roof support columns at the outer edges */}
      {[
        [-12, -14.8], [0, -14.8], [12, -14.8],
        [-12, 14.8], [0, 14.8], [12, 14.8],
        [-18.2, -6], [-18.2, 6], [18.2, -6], [18.2, 6],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 7.4, z]}>
          <cylinderGeometry args={[0.3, 0.3, 6.6, 6]} />
          {L('#eef0f2')}
        </mesh>
      ))}
    </group>
  )
}

/** Port Vell aquarium on its pier */
function Aquarium() {
  const glass = useMemo(
    () => new THREE.MeshLambertMaterial({ map: glassTexture(), color: '#9fcbe0' }),
    [],
  )
  return (
    <group position={[28, 0, 140]} rotation-y={-0.2}>
      <mesh position={[0, 0.5, 2]}>
        <boxGeometry args={[20, 1, 16]} />
        {L('#cbc4b4')}
      </mesh>
      <mesh position={[-2, 3.4, 1]} material={glass}>
        <cylinderGeometry args={[5.4, 5.7, 4.8, 12]} />
      </mesh>
      <mesh position={[-2, 5.8, 1]}>
        <sphereGeometry args={[5.4, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#3d8fc9" roughness={0.35} metalness={0.2} />
      </mesh>
      {/* leaping fish sign */}
      <group position={[6.5, 3.4, 6]} rotation-y={0.6}>
        <mesh position={[0, -1.2, 0]}>
          <cylinderGeometry args={[0.12, 0.16, 3.4, 5]} />
          {L('#8f99a8')}
        </mesh>
        <mesh rotation-z={-0.5} rotation-x={Math.PI / 2}>
          <coneGeometry args={[0.55, 2.4, 6]} />
          {L('#2a6fd6', true)}
        </mesh>
        <mesh position={[1, 0.65, 0]} rotation-z={0.7}>
          <coneGeometry args={[0.5, 1, 3]} />
          {L('#2a6fd6', true)}
        </mesh>
      </group>
    </group>
  )
}

/** Parc Güell — terrace, serpentine bench and the gatehouses */
function ParcGuell() {
  const benchColors = ['#4fa3c4', '#e0938a', '#e8d9a0', '#7fc9a8', '#b48fd9', '#4fa3c4', '#e0938a']
  return (
    <group position={[20, 0, -185]}>
      <mesh>
        <coneGeometry args={[17, 9, 9]} />
        {L('#8fb573', true)}
      </mesh>
      <mesh position={[0, 8.4, 0]}>
        <cylinderGeometry args={[8.5, 9.5, 1.4, 10]} />
        {L('#e3cf9f', true)}
      </mesh>
      {/* serpentine mosaic bench along the terrace edge */}
      {benchColors.map((c, i) => {
        const a = -0.4 + (i / benchColors.length) * Math.PI * 1.5
        return (
          <mesh key={i} position={[Math.cos(a) * 7.6, 9.5, Math.sin(a) * 7.6]} rotation-y={-a}>
            <boxGeometry args={[0.7, 1, 2.6]} />
            {L(c)}
          </mesh>
        )
      })}
      {/* gingerbread gatehouses */}
      {[[-4, 8.5], [4, 8.5]].map(([x, z], i) => (
        <group key={i} position={[x, 3.2, z]}>
          <mesh>
            <boxGeometry args={[2.6, 3, 2.6]} />
            {L('#efe6d2')}
          </mesh>
          <mesh position={[0, 2.3, 0]}>
            <coneGeometry args={[2, 2.6, 7]} />
            {L(i ? '#b48fd9' : '#4fa3c4', true)}
          </mesh>
          <mesh position={[0, 4, 0]}>
            <boxGeometry args={[0.25, 1.2, 0.25]} />
            {L('#f4efe4')}
          </mesh>
        </group>
      ))}
    </group>
  )
}

function TorreGlories() {
  const mats = useMemo(() => {
    const led = ledTexture()
    const side = new THREE.MeshStandardMaterial({
      map: led,
      emissiveMap: led,
      emissive: new THREE.Color('#ffffff'),
      emissiveIntensity: 0.28,
      roughness: 0.4,
    })
    const cap = new THREE.MeshStandardMaterial({ color: '#31414f', roughness: 0.4 })
    return [side, cap, cap]
  }, [])
  return (
    <group position={[198, 0, 22]}>
      <mesh position={[0, 14, 0]} material={mats}>
        <cylinderGeometry args={[5.2, 7, 28, 14]} />
      </mesh>
      <mesh position={[0, 28, 0]}>
        <sphereGeometry args={[5.2, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#3d6f8c" roughness={0.35} metalness={0.25} />
      </mesh>
    </group>
  )
}

function WHotel() {
  // the sail: straight spine aft, curved leading edge — extruded profile
  const sailGeom = useMemo(() => {
    const s = new THREE.Shape()
    s.moveTo(0, 0)
    s.lineTo(0, 26) // vertical spine
    s.bezierCurveTo(-6.5, 25.6, -10.4, 19.5, -10.9, 12.5)
    s.bezierCurveTo(-11.2, 5.5, -10.7, 0, -10.2, 0)
    s.closePath()
    const g = new THREE.ExtrudeGeometry(s, { depth: 3.4, bevelEnabled: false })
    g.translate(0, 0, -1.7)
    return g
  }, [])
  const sailMats = useMemo(() => {
    const t = glassTexture().clone()
    t.needsUpdate = true
    t.repeat.set(0.42, 0.42) // lid UVs are in shape units — tile the mullion grid
    const faces = new THREE.MeshStandardMaterial({ map: t, color: '#9cc5de', roughness: 0.3, metalness: 0.2 })
    const rim = new THREE.MeshStandardMaterial({ color: '#7fa8c2', roughness: 0.35, metalness: 0.2 })
    return [faces, rim]
  }, [])
  const glass = useMemo(
    () => new THREE.MeshLambertMaterial({ map: glassTexture(), color: '#a9cfe2' }),
    [],
  )
  return (
    <group position={[-20, 0, 146]} rotation-y={0.9}>
      <mesh geometry={sailGeom} material={sailMats} />
      {/* glass podium block */}
      <mesh position={[3.5, 3, 3]} material={glass}>
        <boxGeometry args={[13, 6, 9]} />
      </mesh>
      {/* protruding fin ledges on the curved edge */}
      {[8.5, 10].map((y) => (
        <mesh key={y} position={[-10.6, y, 0]}>
          <boxGeometry args={[2.6, 0.28, 3.8]} />
          {L('#e8ecef')}
        </mesh>
      ))}
      {[20, 21.4].map((y) => (
        <mesh key={y} position={[-3.2, y, 1.9]}>
          <boxGeometry args={[2.4, 0.24, 0.7]} />
          {L('#e8ecef')}
        </mesh>
      ))}
      {/* the W badge near the top */}
      <mesh position={[-1.6, 23.2, 1.85]}>
        <boxGeometry args={[1.7, 1.2, 0.18]} />
        {L('#f4f6f8')}
      </mesh>
    </group>
  )
}

/** office district on the upper Diagonal: L'Illa, Hello World HQ and glass neighbors */
const DIAGONAL_TILT = -0.258 // aligns long facades with the avenue

function helloWorldSignTexture() {
  const c = document.createElement('canvas')
  c.width = 512
  c.height = 128
  const g = c.getContext('2d')!
  g.fillStyle = '#0a2240'
  g.fillRect(0, 0, 512, 128)
  // splash roundel
  g.fillStyle = '#0056b5'
  g.beginPath()
  g.arc(64, 64, 40, 0, Math.PI * 2)
  g.fill()
  g.fillStyle = '#f0e9dc'
  g.beginPath()
  g.moveTo(64, 34)
  g.bezierCurveTo(76, 52, 82, 62, 82, 72)
  g.arc(64, 72, 18, 0, Math.PI, false)
  g.bezierCurveTo(46, 62, 52, 52, 64, 34)
  g.fill()
  g.fillStyle = '#f0e9dc'
  g.font = '800 44px "Plus Jakarta Sans", Helvetica, sans-serif'
  g.textBaseline = 'middle'
  g.fillText('HELLO WORLD', 122, 68)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  return t
}

function DiagonalOffices() {
  const glass = useMemo(() => {
    const t = glassTexture().clone()
    t.needsUpdate = true
    t.repeat.set(3, 6)
    return new THREE.MeshLambertMaterial({ map: t, color: '#9fbdd4' })
  }, [])
  const signMat = useMemo(
    () => new THREE.MeshBasicMaterial({ map: helloWorldSignTexture() }),
    [],
  )
  return (
    <group>
      {/* L'Illa Diagonal — Moneo's "horizontal skyscraper", long white stepped slab */}
      <group position={[-160, 0, -112]} rotation-y={DIAGONAL_TILT}>
        <mesh position={[0, 5.5, 0]}>
          <boxGeometry args={[46, 11, 11]} />
          {L('#eef0ea', true)}
        </mesh>
        <mesh position={[-8, 13, 0]}>
          <boxGeometry args={[18, 4, 10]} />
          {L('#e6e8e2', true)}
        </mesh>
        <mesh position={[13, 12.2, 0]}>
          <boxGeometry args={[12, 2.4, 10]} />
          {L('#e6e8e2', true)}
        </mesh>
        {/* window slots */}
        {[-18, -9, 0, 9, 18].map((x) => (
          <mesh key={x} position={[x, 5.5, 5.6]}>
            <boxGeometry args={[5.5, 8, 0.15]} />
            {L('#33415a')}
          </mesh>
        ))}
        {/* street canopy */}
        <mesh position={[0, 1.6, 6.4]}>
          <boxGeometry args={[44, 0.35, 2.4]} />
          {L('#c9cbc4')}
        </mesh>
      </group>

      {/* Hello World HQ — navy glass tower, beige spine, rooftop sign */}
      <group position={[-122, 0, -97]} rotation-y={DIAGONAL_TILT}>
        <mesh position={[0, 11, 0]}>
          <boxGeometry args={[10, 22, 9]} />
          <meshStandardMaterial color="#28486e" roughness={0.3} metalness={0.2} />
        </mesh>
        <mesh position={[3.2, 11, 0]}>
          <boxGeometry args={[1.6, 22, 9.4]} />
          {L('#f0e9dc')}
        </mesh>
        <mesh position={[0, 22.4, 0]}>
          <boxGeometry args={[10.5, 0.8, 9.5]} />
          {L('#0a2240')}
        </mesh>
        {/* rooftop billboard, readable from the seaward side + the tram */}
        <group position={[0, 24.6, 0]}>
          <mesh>
            <boxGeometry args={[11, 3.4, 0.5]} />
            {L('#0a2240')}
          </mesh>
          <mesh position={[0, 0, 0.3]} material={signMat}>
            <planeGeometry args={[10.4, 2.6]} />
          </mesh>
        </group>
      </group>

      {/* glass neighbors along the avenue */}
      {[
        { p: [-185, -125] as [number, number], h: 17, w: 9 },
        { p: [-105, -85] as [number, number], h: 20, w: 8 },
        { p: [-95, -103] as [number, number], h: 14, w: 8 },
      ].map(({ p, h, w }, i) => (
        <group key={i} position={[p[0], 0, p[1]]} rotation-y={DIAGONAL_TILT}>
          <mesh position={[0, h / 2, 0]} material={glass}>
            <boxGeometry args={[w, h, w]} />
          </mesh>
          <mesh position={[0, h + 0.4, 0]}>
            <boxGeometry args={[w * 0.8, 0.8, w * 0.8]} />
            {L('#c2c6cc')}
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** the Port Olímpic twins — Torre Mapfre + Hotel Arts (no labels, skyline flavor) */
function TorresMapfre() {
  const gridGlass = useMemo(() => {
    const t = glassTexture().clone()
    t.needsUpdate = true
    t.repeat.set(2, 8)
    return new THREE.MeshLambertMaterial({ map: t, color: '#dfe0e2' })
  }, [])
  return (
    <group>
      {/* Torre Mapfre: pale concrete grid */}
      <group position={[97, 0, 109]}>
        <mesh position={[0, 17, 0]} material={gridGlass}>
          <boxGeometry args={[7, 34, 7]} />
        </mesh>
        <mesh position={[0, 34.4, 0]}>
          <boxGeometry args={[5.5, 0.8, 5.5]} />
          {L('#c2c6cc')}
        </mesh>
      </group>
      {/* Hotel Arts: dark glass in an exposed white steel frame */}
      <group position={[108, 0, 113]}>
        <mesh position={[0, 16.5, 0]}>
          <meshStandardMaterial color="#3d4c5e" roughness={0.3} metalness={0.25} />
          <boxGeometry args={[7, 33, 7]} />
        </mesh>
        {[[-3.7, -3.7], [3.7, -3.7], [-3.7, 3.7], [3.7, 3.7]].map(([x, z], i) => (
          <mesh key={i} position={[x, 16.5, z]}>
            <boxGeometry args={[0.5, 33, 0.5]} />
            {L('#eef0f2')}
          </mesh>
        ))}
        {[8, 16, 24, 32].map((y) => (
          <mesh key={y} position={[0, y, 0]}>
            <boxGeometry args={[7.9, 0.4, 7.9]} />
            {L('#eef0f2')}
          </mesh>
        ))}
      </group>
    </group>
  )
}

function MontjuicCastle() {
  return (
    <group position={[-230, 42, 135]}>
      <mesh position={[0, 2.2, 0]}>
        <boxGeometry args={[15, 4.4, 11]} />
        {L('#c9bb9e', true)}
      </mesh>
      {[[-6.5, -4.5], [6.5, -4.5], [-6.5, 4.5], [6.5, 4.5]].map(([x, z], i) => (
        <mesh key={i} position={[x, 5, z]}>
          <boxGeometry args={[2.6, 3, 2.6]} />
          {L('#bcac8c', true)}
        </mesh>
      ))}
      {/* flag */}
      <mesh position={[0, 6.6, 0]}>
        <boxGeometry args={[0.2, 4, 0.2]} />
        {L('#6b5d49')}
      </mesh>
      <mesh position={[0.8, 8, 0]}>
        <boxGeometry args={[1.6, 1, 0.1]} />
        {L('#d94f3d')}
      </mesh>
    </group>
  )
}

/** Telefèric de Montjuïc — pylons, twin cables and glass-band gondolas up to the castle */
const TEL_BASE = new THREE.Vector3(-180, 10, 52) // cable end over the lower station
const TEL_TOP = new THREE.Vector3(-227, 46, 126) // cable end at the summit station

function Teleferic() {
  const cabins = useRef<Array<THREE.Group | null>>([])
  const span = useMemo(() => new THREE.Vector3().subVectors(TEL_TOP, TEL_BASE), [])
  const yaw = Math.atan2(span.x, span.z)
  const horiz = Math.hypot(span.x, span.z)
  const pitch = -Math.atan2(span.y, horiz)
  const length = span.length()
  // horizontal perpendicular for the two cable tracks
  const perp = useMemo(() => new THREE.Vector3(span.z, 0, -span.x).normalize(), [span])

  const CABINS = [
    { track: 1, phase: 0.0, speed: 0.05 },
    { track: -1, phase: 0.45, speed: 0.05 },
    { track: 1, phase: 0.65, speed: 0.05 },
  ]

  useFrame(({ clock }) => {
    const time = clock.elapsedTime
    CABINS.forEach((c, i) => {
      const g = cabins.current[i]
      if (!g) return
      const u = (c.phase + time * c.speed) % 2
      const t = u < 1 ? u : 2 - u // ping-pong 0..1
      const ascending = u < 1
      g.position
        .copy(TEL_BASE)
        .addScaledVector(span, t)
        .addScaledVector(perp, c.track * 1.3)
      g.position.y -= 2.3 // hang below the cable
      g.rotation.y = yaw
      if (i === 0) {
        rideStates.teleferic.pos.copy(g.position)
        rideStates.teleferic.dir
          .set(span.x, 0, span.z)
          .normalize()
          .multiplyScalar(ascending ? 1 : -1)
      }
    })
  })

  const station = (pos: [number, number, number]) => (
    <group position={pos}>
      <mesh position={[0, 1.1, 0]}>
        <boxGeometry args={[7, 2.2, 6]} />
        {L('#cbc4b4', true)}
      </mesh>
      <mesh position={[0, 6.5, 0]}>
        <boxGeometry args={[1.1, 8.8, 1.1]} />
        {L('#8f99a8')}
      </mesh>
      <mesh position={[0, 10.6, 0]}>
        <boxGeometry args={[1.4, 0.5, 4.4]} />
        {L('#5a5e66')}
      </mesh>
    </group>
  )

  return (
    <group>
      {station([TEL_BASE.x, 0, TEL_BASE.z])}
      {station([TEL_TOP.x, 36, TEL_TOP.z])}
      {/* twin cables */}
      {[1, -1].map((side) => (
        <mesh
          key={side}
          position={[
            (TEL_BASE.x + TEL_TOP.x) / 2 + perp.x * side * 1.3,
            (TEL_BASE.y + TEL_TOP.y) / 2,
            (TEL_BASE.z + TEL_TOP.z) / 2 + perp.z * side * 1.3,
          ]}
          rotation={[pitch, yaw, 0, 'YXZ']}
        >
          <boxGeometry args={[0.14, 0.14, length]} />
          {L('#3a4048')}
        </mesh>
      ))}
      {/* pylons with cross-arms */}
      {[
        { t: 0.28, ground: 0 },
        { t: 0.66, ground: 24 },
      ].map(({ t, ground }, i) => {
        const px = TEL_BASE.x + span.x * t
        const pz = TEL_BASE.z + span.z * t
        const cableY = TEL_BASE.y + span.y * t
        return (
          <group key={i} position={[px, 0, pz]}>
            <mesh position={[0, (ground + cableY + 1) / 2, 0]}>
              <boxGeometry args={[1.2, cableY + 1 - ground, 1.2]} />
              {L('#8f99a8')}
            </mesh>
            <mesh position={[0, cableY + 0.8, 0]} rotation-y={yaw}>
              <boxGeometry args={[4.4, 0.5, 1]} />
              {L('#5a5e66')}
            </mesh>
          </group>
        )
      })}
      {/* gondolas */}
      {CABINS.map((_, i) => (
        <group key={i} ref={(el) => (cabins.current[i] = el)}>
          <mesh position={[0, 2, 0]}>
            <boxGeometry args={[0.16, 1.6, 0.16]} />
            {L('#3a4048')}
          </mesh>
          <mesh position={[0, 2.9, 0]}>
            <boxGeometry args={[0.6, 0.35, 0.9]} />
            {L('#5a5e66')}
          </mesh>
          <mesh position={[0, 0.35, 0]}>
            <boxGeometry args={[2.4, 1, 2.2]} />
            {L('#c9ccd0')}
          </mesh>
          <mesh position={[0, 1.15, 0]}>
            <boxGeometry args={[2.5, 0.75, 2.3]} />
            <meshStandardMaterial color="#26303c" roughness={0.25} metalness={0.15} />
          </mesh>
          <mesh position={[0, 1.62, 0]}>
            <boxGeometry args={[2.3, 0.25, 2.1]} />
            {L('#e5e1d4')}
          </mesh>
        </group>
      ))}
    </group>
  )
}

function PortCranes() {
  return (
    <group>
      {[[-148, 162], [-172, 170]].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]} rotation-y={i * 0.6}>
          <mesh position={[-2.5, 5, 0]}>
            <boxGeometry args={[1, 10, 1]} />
            {L('#c2453a')}
          </mesh>
          <mesh position={[2.5, 5, 0]}>
            <boxGeometry args={[1, 10, 1]} />
            {L('#c2453a')}
          </mesh>
          <mesh position={[0, 10.4, 3]} rotation-x={0.35}>
            <boxGeometry args={[1, 1, 14]} />
            {L('#c2453a')}
          </mesh>
        </group>
      ))}
      <mesh position={[-158, 0.3, 178]} rotation-y={0.25}>
        <boxGeometry args={[46, 0.6, 14]} />
        {L('#b9b2a2')}
      </mesh>
    </group>
  )
}

function ColumbusColumn() {
  return (
    <group position={[68, 0, 116]}>
      <mesh position={[0, 5.5, 0]}>
        <cylinderGeometry args={[0.7, 0.9, 11, 8]} />
        {L('#8d6e5a')}
      </mesh>
      <mesh position={[0, 11.6, 0]}>
        <sphereGeometry args={[1, 8, 6]} />
        {L('#e3c04d')}
      </mesh>
    </group>
  )
}

function BeachUmbrellas() {
  const colors = ['#d94f3d', '#e8b93c', '#3d76c9', '#4aa46a', '#e07a2f']
  return (
    <group>
      {colors.map((c, i) => (
        <group key={i} position={[30 + i * 22, 0, 132 - i * 4]}>
          <mesh position={[0, 1.5, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 3, 5]} />
            {L('#8a6a4d')}
          </mesh>
          <mesh position={[0, 3, 0]}>
            <coneGeometry args={[2.2, 1.2, 8]} />
            {L(c, true)}
          </mesh>
        </group>
      ))}
    </group>
  )
}

export default function Landmarks() {
  const root = useRef<THREE.Group>(null)
  // Barcelona floods its landmarks at night: give every landmark material a
  // warm self-glow driven by the same curve as the building windows.
  const lit = useRef<Array<{ m: THREE.MeshLambertMaterial; base: THREE.Color }>>([])
  const lastGlow = useRef(-1)

  useEffect(() => {
    const seen = new Set<THREE.Material>()
    const list: Array<{ m: THREE.MeshLambertMaterial; base: THREE.Color }> = []
    root.current?.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (!mesh.isMesh) return
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      for (const m of mats) {
        const lm = m as THREE.MeshLambertMaterial
        // skip anything already emissive (neon, LEDs) and duplicates
        if (!lm.emissive || seen.has(m) || lm.emissive.getHex() !== 0) continue
        seen.add(m)
        list.push({ m: lm, base: lm.color.clone() })
      }
    })
    lit.current = list
  }, [])

  useFrame(() => {
    const glow = windowGlowAt(useTour.getState().timeOfDay)
    if (Math.abs(glow - lastGlow.current) < 0.01) return
    lastGlow.current = glow
    const e = glow * 0.62
    for (const { m, base } of lit.current) {
      // warm-tinted floodlight: the material's own colour, pushed toward amber
      m.emissive.copy(base).multiplyScalar(e)
      m.emissive.r = Math.min(1, m.emissive.r * 1.25)
      m.emissive.g = Math.min(1, m.emissive.g * 1.05)
      m.emissive.b *= 0.75
    }
  })

  return (
    <group ref={root}>
      <CasaBatllo />
      <TibidaboTemple />
      <TibidaboPark />
      <Boqueria />
      <Airport />
      <Moco />
      <SagradaFamilia />
      <LaPedrera />
      <Aquarium />
      <ParcGuell />
      <CampNou />
      <RCDEStadium />
      <TorreGlories />
      <WHotel />
      <TorresMapfre />
      <DiagonalOffices />
      <MontjuicCastle />
      <Teleferic />
      <PortCranes />
      <ColumbusColumn />
      <BeachUmbrellas />
    </group>
  )
}
