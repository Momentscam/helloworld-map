import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { C, ROADS, RAMBLA, displace, groundShape, mulberry32, type Pt } from './geo'
import {
  facadeTexture,
  facadeNightTexture,
  oldTownTexture,
  oldTownNightTexture,
  seaTexture,
  terrainTexture,
} from './textures'
import { windowGlowAt } from './lighting'
import { useTour } from './store'

const COAST: Pt[] = [
  [-620, 250], [-400, 230], [-250, 185], [-60, 150], [120, 115], [250, 95], [420, 45], [620, 10],
]
const LAND: Pt[] = [...COAST, [680, -680], [-680, -680]]

const distToSeg = (px: number, pz: number, a: Pt, b: Pt) => {
  const dx = b[0] - a[0], dz = b[1] - a[1]
  const t = Math.max(0, Math.min(1, ((px - a[0]) * dx + (pz - a[1]) * dz) / (dx * dx + dz * dz)))
  return Math.hypot(px - (a[0] + dx * t), pz - (a[1] + dz * t))
}
const distToPath = (px: number, pz: number, pts: Pt[]) => {
  let d = Infinity
  for (let i = 1; i < pts.length; i++) d = Math.min(d, distToSeg(px, pz, pts[i - 1], pts[i]))
  return d
}

// ---------------------------------------------------------------- ground
function Ground() {
  const land = useMemo(() => groundShape(LAND), [])
  const shallow = useMemo(() => {
    const off: Pt[] = [...COAST].reverse().map(([x, z]) => [x, z + 26] as Pt)
    return groundShape([...COAST, ...off])
  }, [])
  const beach = useMemo(() => {
    const beachPts: Pt[] = [[-60, 150], [120, 115], [250, 95], [420, 45]]
    return groundShape([...beachPts, ...[...beachPts].reverse().map(([x, z]) => [x, z + 10] as Pt)])
  }, [])
  const collserola = useMemo(
    () => groundShape([[-660, -200], [660, -200], [680, -680], [-680, -680]]),
    [],
  )
  const ciutadella = useMemo(() => {
    const g = new THREE.CircleGeometry(1, 24)
    g.rotateX(Math.PI / 2)
    return g
  }, [])
  const seaMap = useMemo(() => {
    const t = seaTexture()
    t.repeat.set(9, 6)
    return t
  }, [])
  const bandMap = useMemo(() => {
    // Collserola shape UVs are world coords — tiny repeat = ~110-unit tiles
    const t = terrainTexture('band')
    t.repeat.set(0.009, 0.009)
    return t
  }, [])
  const mat = (color: string) => <meshLambertMaterial color={color} side={THREE.DoubleSide} />

  useFrame((_, dt) => {
    // slow current drift across the water
    seaMap.offset.x += dt * 0.0022
    seaMap.offset.y += dt * 0.0011
  })

  return (
    <group>
      <mesh position={[0, -0.6, 0]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[2600, 1700]} />
        <meshLambertMaterial map={seaMap} color="#cfe2f0" />
      </mesh>
      <mesh geometry={shallow} position={[0, -0.35, 0]}>{mat(C.seaShallow)}</mesh>
      <mesh geometry={land} position={[0, 0, 0]}>{mat(C.land)}</mesh>
      <mesh geometry={beach} position={[0, 0.35, 0]}>{mat(C.beach)}</mesh>
      <mesh geometry={collserola} position={[0, 0.55, 0]}>
        <meshLambertMaterial map={bandMap} color="#e8eadc" side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={ciutadella} position={[145, 0.7, 62]} scale={[42, 1, 30]}>{mat(C.park)}</mesh>
      <mesh position={[33, 0.7, 33]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[10, 8]} />
        <meshLambertMaterial color={'#e3cf9f'} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

// ---------------------------------------------------------------- hills
function Hills() {
  const ridge: Array<[number, number, number, number]> = [
    [-280, -300, 80, 58], [-180, -320, 85, 52], [-10, -330, 95, 60],
    [150, -310, 80, 48], [300, -320, 90, 56], [420, -290, 70, 40], [-420, -310, 90, 50],
    [-330, -430, 110, 64], [-120, -460, 130, 70], [120, -440, 120, 62],
    [340, -450, 115, 58], [520, -400, 100, 48], [-540, -420, 105, 52],
  ]
  const hillMap = useMemo(() => {
    const t = terrainTexture('hill')
    t.repeat.set(3, 2)
    return t
  }, [])
  // craggy silhouettes: displaced vertices (seam-safe), flat-shaded
  const ridgeGeoms = useMemo(
    () =>
      ridge.map(([, , r, h], i) =>
        displace(new THREE.ConeGeometry(r, h, 9 + (i % 3), 4), r * 0.11, h * 0.13),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
  const tibidaboGeom = useMemo(
    () => displace(new THREE.CylinderGeometry(30, 118, 108, 12, 6), 9, 7, { from: 22, to: 50 }),
    [],
  )
  const montjuicGeom = useMemo(
    () => displace(new THREE.CylinderGeometry(17, 72, 42, 10, 4), 5.5, 4, { from: 6, to: 19 }),
    [],
  )
  // dedicated hill for the Torre de Collserola — left of Tibidabo, grounded
  // (positioned at y=h/2 so the full cone sits on the ground, apex ~62)
  const towerHillGeom = useMemo(
    () => displace(new THREE.ConeGeometry(46, 62, 10, 4), 5, 8),
    [],
  )
  return (
    <group>
      {/* Tibidabo: flat-topped mountain with a summit terrace for the park */}
      <mesh geometry={tibidaboGeom} position={[-95, 54, -260]}>
        <meshLambertMaterial map={hillMap} color="#d0d8bc" flatShading />
      </mesh>
      <mesh position={[-95, 108.3, -260]}>
        <cylinderGeometry args={[30, 30, 0.7, 10]} />
        <meshLambertMaterial color={'#9db97e'} flatShading />
      </mesh>
      {/* pedestal that lifts the temple above the rides */}
      <mesh position={[-95, 111.5, -260]}>
        <cylinderGeometry args={[12.5, 14.5, 7, 8]} />
        <meshLambertMaterial color={'#b3a488'} flatShading />
      </mesh>
      {ridge.map(([x, z], i) => (
        <mesh key={i} geometry={ridgeGeoms[i]} position={[x, 0, z]}>
          <meshLambertMaterial map={hillMap} color={i % 2 ? '#eaeedd' : '#ccd6b8'} flatShading />
        </mesh>
      ))}
      {/* Montjuïc: flat summit so the castle sits on solid ground */}
      <mesh geometry={montjuicGeom} position={[-230, 21, 135]}>
        <meshLambertMaterial map={hillMap} color="#e4ead2" flatShading />
      </mesh>
      {/* Turó de Vilana — hill for the Torre de Collserola, left of Tibidabo */}
      <mesh geometry={towerHillGeom} position={[-235, 31, -300]}>
        <meshLambertMaterial map={hillMap} color="#ccd6b8" flatShading />
      </mesh>
    </group>
  )
}


// ---------------------------------------------------------------- roads
function Strip({ pts, width, color, y }: { pts: Pt[]; width: number; color: string; y: number }) {
  const segs = useMemo(() => {
    const out: Array<{ pos: [number, number, number]; len: number; ang: number }> = []
    for (let i = 1; i < pts.length; i++) {
      const [x1, z1] = pts[i - 1]
      const [x2, z2] = pts[i]
      out.push({
        pos: [(x1 + x2) / 2, y, (z1 + z2) / 2],
        len: Math.hypot(x2 - x1, z2 - z1) + width * 0.6,
        ang: Math.atan2(x2 - x1, z2 - z1),
      })
    }
    return out
  }, [pts, width, y])
  return (
    <group>
      {segs.map((s, i) => (
        <mesh key={i} position={s.pos} rotation-y={s.ang}>
          <boxGeometry args={[width, 0.12, s.len]} />
          <meshLambertMaterial color={color} />
        </mesh>
      ))}
    </group>
  )
}

function Roads() {
  const minors = useMemo(() => {
    const v: Pt[][] = []
    for (let i = -5; i <= 9; i++) v.push([[i * 22, -110], [i * 22, 33]])
    for (let j = -5; j <= 1; j++) v.push([[-132, j * 22], [198, j * 22]])
    return v
  }, [])
  return (
    <group>
      {minors.map((p, i) => (
        <Strip key={i} pts={p} width={2.2} color={C.roadMinor} y={0.07} />
      ))}
      {Object.entries(ROADS).map(([k, pts]) => (
        <Strip key={k} pts={pts} width={k === 'mountainRoad' ? 3.5 : 6} color={C.road} y={0.11} />
      ))}
      <Strip pts={RAMBLA} width={6} color={'#dcc89b'} y={0.13} />
    </group>
  )
}

// ---------------------------------------------------------------- building data
const AVOID: Array<[number, number, number]> = [
  [-11, -33, 16], // casa batlló
  [11, -77, 14], // la pedrera (mountain side of Pg. de Gràcia, opposite Casa Batlló)
  [99, -55, 27], // sagrada
  [33, 33, 15], // plaça catalunya
  [198, 22, 14], // torre glòries
]

interface EixItem {
  x: number
  z: number
  h: number
  c: THREE.Color
}

function buildEixampleItems(): EixItem[] {
  const rng = mulberry32(42)
  const out: EixItem[] = []
  for (let i = -5; i <= 9; i++) {
    for (let j = -4; j <= 5; j++) {
      const x = i * 22 - 11
      const z = j * 22 - 11
      if (x >= 25 && z >= 33) continue
      if (AVOID.some(([ax, az, r]) => Math.hypot(x - ax, z - az) < r)) continue
      if (distToPath(x, z, ROADS.diagonal) < 12) continue
      if (distToPath(x, z, ROADS.meridiana) < 11) continue
      const h = 7 + rng() * 8
      const palette = rng() > 0.92 ? C.buildingAccent : C.building
      out.push({ x, z, h, c: new THREE.Color(palette[Math.floor(rng() * palette.length)]) })
    }
  }
  return out
}
const EIX_ITEMS = buildEixampleItems()

interface ScatterItem {
  x: number
  z: number
  w: number
  d: number
  h: number
  rot: number
  c: THREE.Color
  hip: boolean
}

function buildScatterItems(): ScatterItem[] {
  const rng = mulberry32(1234)
  const out: ScatterItem[] = []
  const push = (x: number, z: number, sMin: number, sMax: number, hMin: number, hMax: number, hipChance: number) => {
    out.push({
      x, z,
      w: sMin + rng() * (sMax - sMin),
      d: sMin + rng() * (sMax - sMin),
      h: hMin + rng() * (hMax - hMin),
      rot: (rng() - 0.5) * 0.5,
      c: new THREE.Color(C.building[Math.floor(rng() * C.building.length)]),
      hip: rng() < hipChance,
    })
  }
  // old town (Gòtic / Born / Raval)
  for (let n = 0; n < 230; n++) {
    const x = 25 + rng() * 140
    const z = 36 + rng() * 76
    if (((x - 145) / 44) ** 2 + ((z - 62) / 32) ** 2 < 1) continue
    if (distToPath(x, z, RAMBLA) < 6) continue
    if (Math.hypot(x - 55, z - 80) < 14) continue
    if (Math.hypot(x - 110, z - 72) < 10) continue
    if (Math.hypot(x - 68, z - 116) < 7) continue
    if (Math.hypot(x - 103, z - 111) < 13) continue // torres mapfre
    push(x, z, 4, 8, 4, 9, 0.85)
  }
  for (let n = 0; n < 90; n++) push(-60 + rng() * 115, -160 + rng() * 42, 4, 7, 4, 8, 0.85)
  for (let n = 0; n < 70; n++) {
    const x = -260 + rng() * 120
    const z = -80 + rng() * 120
    if (Math.hypot(x + 210, z + 35) < 34) continue // camp nou
    push(x, z, 5, 9, 4, 11, 0.4)
  }
  for (let n = 0; n < 80; n++) {
    const x = 220 + rng() * 160
    const z = -20 + rng() * 88
    if (distToPath(x, z, ROADS.ronda) < 9) continue
    if (Math.hypot(x - 198, z - 22) < 14) continue
    push(x, z, 5, 9, 4, 10, 0.35)
  }
  for (let n = 0; n < 55; n++) {
    const x = -220 + rng() * 440
    const z = -205 + rng() * 40
    if (Math.abs(x + 88) < 9) continue
    if (Math.hypot(x + 95, z + 260) < 130) continue // tibidabo slopes
    if (Math.hypot(x - 20, z + 185) < 24) continue // parc güell
    push(x, z, 4, 7, 3, 7, 0.8)
  }
  return out
}
const SCATTER_ITEMS = buildScatterItems()

// ---------------------------------------------------------------- eixample
function chamferedBlockGeometry() {
  const c = 0.24
  const s = new THREE.Shape()
  s.moveTo(-0.5 + c, -0.5)
  s.lineTo(0.5 - c, -0.5)
  s.lineTo(0.5, -0.5 + c)
  s.lineTo(0.5, 0.5 - c)
  s.lineTo(0.5 - c, 0.5)
  s.lineTo(-0.5 + c, 0.5)
  s.lineTo(-0.5, 0.5 - c)
  s.lineTo(-0.5, -0.5 + c)
  s.closePath()
  const g = new THREE.ExtrudeGeometry(s, { depth: 1, bevelEnabled: false })
  g.rotateX(-Math.PI / 2) // extrude +z -> +y, base at y=0
  // continuous wrap UVs on the walls: u follows the angle around the block,
  // v follows height — so the facade texture tiles cleanly around all 8 sides
  const pos = g.getAttribute('position')
  const nrm = g.getAttribute('normal')
  const uv = g.getAttribute('uv')
  for (let i = 0; i < pos.count; i++) {
    if (Math.abs(nrm.getY(i)) < 0.5) {
      const ang = Math.atan2(pos.getZ(i), pos.getX(i))
      uv.setXY(i, (ang / (Math.PI * 2) + 0.5) * 12, pos.getY(i))
    }
  }
  uv.needsUpdate = true
  return g
}

function EixampleBlocks() {
  const ref = useRef<THREE.InstancedMesh>(null)
  const geom = useMemo(chamferedBlockGeometry, [])
  const materials = useMemo(
    () => [
      new THREE.MeshLambertMaterial({ color: '#b3a78d' }), // roof lid
      new THREE.MeshLambertMaterial({
        map: facadeTexture(),
        emissive: '#ffffff',
        emissiveMap: facadeNightTexture(),
        emissiveIntensity: 0,
      }), // walls — windows glow after dark
    ],
    [],
  )

  useFrame(() => {
    materials[1].emissiveIntensity = windowGlowAt(useTour.getState().timeOfDay) * 0.85
  })

  useLayoutEffect(() => {
    const m = ref.current
    if (!m) return
    const mat = new THREE.Matrix4()
    EIX_ITEMS.forEach((b, i) => {
      mat.makeScale(16, b.h, 16)
      mat.setPosition(b.x, 0, b.z)
      m.setMatrixAt(i, mat)
      m.setColorAt(i, b.c)
    })
    m.instanceMatrix.needsUpdate = true
    if (m.instanceColor) m.instanceColor.needsUpdate = true
  }, [])

  return <instancedMesh ref={ref} args={[geom, materials as unknown as THREE.Material, EIX_ITEMS.length]} />
}

/** water tanks, stair huts and AC units on the flat Eixample roofs */
function RoofClutter() {
  const ref = useRef<THREE.InstancedMesh>(null)
  const items = useMemo(() => {
    const rng = mulberry32(555)
    const out: Array<{ x: number; y: number; z: number; s: [number, number, number]; c: THREE.Color }> = []
    const colors = [new THREE.Color('#b9ab90'), new THREE.Color('#9aa3ad'), new THREE.Color('#c96a4a'), new THREE.Color('#e0d6c2')]
    for (const b of EIX_ITEMS) {
      const n = 1 + Math.floor(rng() * 3)
      for (let k = 0; k < n; k++) {
        out.push({
          x: b.x + (rng() - 0.5) * 9,
          y: b.h,
          z: b.z + (rng() - 0.5) * 9,
          s: [1.4 + rng() * 1.8, 1 + rng() * 1.6, 1.4 + rng() * 1.8],
          c: colors[Math.floor(rng() * colors.length)],
        })
      }
    }
    return out
  }, [])

  useLayoutEffect(() => {
    const m = ref.current
    if (!m) return
    const mat = new THREE.Matrix4()
    items.forEach((it, i) => {
      mat.makeScale(...it.s)
      mat.setPosition(it.x, it.y + it.s[1] / 2, it.z)
      m.setMatrixAt(i, mat)
      m.setColorAt(i, it.c)
    })
    m.instanceMatrix.needsUpdate = true
    if (m.instanceColor) m.instanceColor.needsUpdate = true
  }, [items])

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, items.length]}>
      <boxGeometry />
      <meshLambertMaterial />
    </instancedMesh>
  )
}

// ---------------------------------------------------------------- old town & suburbs
function ScatterBlocks() {
  const ref = useRef<THREE.InstancedMesh>(null)
  const materials = useMemo(() => {
    const side = new THREE.MeshLambertMaterial({
      map: oldTownTexture(),
      emissive: '#ffffff',
      emissiveMap: oldTownNightTexture(),
      emissiveIntensity: 0,
    })
    const flat = new THREE.MeshLambertMaterial({ color: '#c4b394' })
    // box face order: +x, -x, +y (roof), -y, +z, -z
    return [side, side, flat, flat, side, side]
  }, [])

  useFrame(() => {
    ;(materials[0] as THREE.MeshLambertMaterial).emissiveIntensity =
      windowGlowAt(useTour.getState().timeOfDay) * 0.8
  })

  useLayoutEffect(() => {
    const m = ref.current
    if (!m) return
    const mat = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const up = new THREE.Vector3(0, 1, 0)
    SCATTER_ITEMS.forEach((b, i) => {
      q.setFromAxisAngle(up, b.rot)
      mat.compose(new THREE.Vector3(b.x, b.h / 2, b.z), q, new THREE.Vector3(b.w, b.h, b.d))
      m.setMatrixAt(i, mat)
      m.setColorAt(i, b.c)
    })
    m.instanceMatrix.needsUpdate = true
    if (m.instanceColor) m.instanceColor.needsUpdate = true
  }, [])

  return (
    <instancedMesh ref={ref} args={[undefined, materials as unknown as THREE.Material, SCATTER_ITEMS.length]}>
      <boxGeometry />
    </instancedMesh>
  )
}

/** terracotta hip roofs over the old town and Gràcia */
function HipRoofs() {
  const ref = useRef<THREE.InstancedMesh>(null)
  const geom = useMemo(() => {
    const g = new THREE.ConeGeometry(1, 1, 4)
    g.rotateY(Math.PI / 4) // align square base to the box below
    g.translate(0, 0.5, 0)
    return g
  }, [])
  const hips = useMemo(() => SCATTER_ITEMS.filter((b) => b.hip), [])
  const shades = useMemo(
    () => [new THREE.Color('#c96a4a'), new THREE.Color('#bd5f41'), new THREE.Color('#d17a56')],
    [],
  )

  useLayoutEffect(() => {
    const m = ref.current
    if (!m) return
    const rng = mulberry32(808)
    const mat = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const up = new THREE.Vector3(0, 1, 0)
    hips.forEach((b, i) => {
      q.setFromAxisAngle(up, b.rot)
      mat.compose(
        new THREE.Vector3(b.x, b.h - 0.05, b.z),
        q,
        new THREE.Vector3(b.w * 0.78, 1.2 + rng() * 1.4, b.d * 0.78),
      )
      m.setMatrixAt(i, mat)
      m.setColorAt(i, shades[Math.floor(rng() * shades.length)])
    })
    m.instanceMatrix.needsUpdate = true
    if (m.instanceColor) m.instanceColor.needsUpdate = true
  }, [hips, shades, geom])

  return (
    <instancedMesh ref={ref} args={[geom, undefined, hips.length]}>
      <meshLambertMaterial flatShading />
    </instancedMesh>
  )
}

// ---------------------------------------------------------------- trees
function Trees() {
  const trunkRef = useRef<THREE.InstancedMesh>(null)
  const crownRef = useRef<THREE.InstancedMesh>(null)
  const spots = useMemo(() => {
    const rng = mulberry32(7)
    const out: Array<{ x: number; z: number; s: number; g: number }> = []
    const add = (x: number, z: number) => out.push({ x, z, s: 0.8 + rng() * 0.7, g: rng() })
    for (let n = 0; n < 26; n++) {
      const a = rng() * Math.PI * 2
      const r = Math.sqrt(rng())
      add(145 + Math.cos(a) * 38 * r, 62 + Math.sin(a) * 26 * r)
    }
    for (let t = 0; t <= 1; t += 0.09) {
      add(33 + (66 - 33) * t + 4, 38 + (112 - 38) * t)
      add(33 + (66 - 33) * t - 4, 38 + (112 - 38) * t)
    }
    for (let t = 0; t <= 1; t += 0.045) {
      const pts = ROADS.diagonal
      const seg = t < 0.5 ? [pts[0], pts[1]] : [pts[1], pts[2]]
      const tt = t < 0.5 ? t * 2 : (t - 0.5) * 2
      add(seg[0][0] + (seg[1][0] - seg[0][0]) * tt, seg[0][1] + (seg[1][1] - seg[0][1]) * tt + 5)
    }
    for (let n = 0; n < 26; n++) {
      const a = rng() * Math.PI * 2
      add(-230 + Math.cos(a) * (58 + rng() * 22), 135 + Math.sin(a) * (58 + rng() * 22))
    }
    for (let n = 0; n < 70; n++) add(-380 + rng() * 760, -236 + rng() * 26)
    for (let n = 0; n < 25; n++) add(-160 + rng() * 380, -120 + rng() * 150 - 40)
    return out.filter(
      (s) =>
        !(Math.hypot(s.x + 11, s.z + 33) < 14) &&
        distToPath(s.x, s.z, ROADS.granVia) > 4 &&
        distToPath(s.x, s.z, ROADS.arago) > 4,
    )
  }, [])

  useLayoutEffect(() => {
    const trunk = trunkRef.current
    const crown = crownRef.current
    if (!trunk || !crown) return
    const mat = new THREE.Matrix4()
    const green = [new THREE.Color('#5f8f4e'), new THREE.Color('#6fa35a'), new THREE.Color('#7fb069')]
    spots.forEach((s, i) => {
      mat.makeScale(s.s, s.s, s.s)
      mat.setPosition(s.x, 0, s.z)
      trunk.setMatrixAt(i, mat)
      mat.makeScale(s.s, s.s, s.s)
      mat.setPosition(s.x, 3.2 * s.s, s.z)
      crown.setMatrixAt(i, mat)
      crown.setColorAt(i, green[Math.floor(s.g * green.length)])
    })
    trunk.instanceMatrix.needsUpdate = true
    crown.instanceMatrix.needsUpdate = true
    if (crown.instanceColor) crown.instanceColor.needsUpdate = true
  }, [spots])

  return (
    <group>
      <instancedMesh ref={trunkRef} args={[undefined, undefined, spots.length]}>
        <cylinderGeometry args={[0.4, 0.55, 4, 5]} />
        <meshLambertMaterial color="#8a6a4d" />
      </instancedMesh>
      <instancedMesh ref={crownRef} args={[undefined, undefined, spots.length]}>
        <icosahedronGeometry args={[2.4, 0]} />
        <meshLambertMaterial flatShading />
      </instancedMesh>
    </group>
  )
}

// ---------------------------------------------------------------- clouds
function Clouds() {
  const group = useRef<THREE.Group>(null)
  const clouds = useMemo(() => {
    const rng = mulberry32(99)
    return Array.from({ length: 7 }, () => ({
      x: -700 + rng() * 1400,
      y: 170 + rng() * 70,
      z: -320 + rng() * 620,
      s: 14 + rng() * 20,
      v: 2.5 + rng() * 3,
    }))
  }, [])
  useFrame((_, dt) => {
    const g = group.current
    if (!g) return
    g.children.forEach((c, i) => {
      c.position.x += clouds[i].v * dt
      if (c.position.x > 760) c.position.x = -760
    })
  })
  return (
    <group ref={group}>
      {clouds.map((c, i) => (
        <group key={i} position={[c.x, c.y, c.z]}>
          <mesh scale={[c.s, c.s * 0.45, c.s * 0.7]}>
            <icosahedronGeometry args={[1, 0]} />
            <meshLambertMaterial color="#ffffff" flatShading />
          </mesh>
          <mesh position={[c.s * 0.8, -1, 2]} scale={[c.s * 0.6, c.s * 0.3, c.s * 0.5]}>
            <icosahedronGeometry args={[1, 0]} />
            <meshLambertMaterial color="#f4f9ff" flatShading />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// ---------------------------------------------------------------- peripheral towns
// full land boundary: the coast, plus the inland corners so the lookup keeps
// following the shoreline past the last coast point (the NE/SW tails) instead
// of flat-lining and letting houses spill into the sea.
const COASTLINE: Pt[] = [[-680, -680], ...COAST, [680, -680]]

/** z of the land edge at a given x (sea is z greater than this) */
function coastZ(x: number): number {
  const c = COASTLINE
  if (x <= c[0][0]) return c[0][1]
  for (let i = 1; i < c.length; i++) {
    if (x <= c[i][0]) {
      const t = (x - c[i - 1][0]) / (c[i][0] - c[i - 1][0])
      return c[i - 1][1] + (c[i][1] - c[i - 1][1]) * t
    }
  }
  return c[c.length - 1][1]
}

interface TownHouse {
  x: number
  z: number
  w: number
  d: number
  h: number
  rot: number
  c: THREE.Color
  roof: THREE.Color
}

// low house clusters ringing Barcelona — no labels, just built fabric:
// the Vallès (Sant Cugat / Cerdanyola) behind Collserola, Badalona and the
// Maresme up the NE coast, and L'Hospitalet / Cornellà to the SW.
const TOWN_ITEMS: TownHouse[] = (() => {
  const rng = mulberry32(9090)
  const clusters = [
    { cx: 150, cz: -616, rx: 98, rz: 44, n: 46 },
    { cx: -250, cz: -606, rx: 86, rz: 42, n: 36 },
    { cx: 500, cz: -34, rx: 92, rz: 46, n: 48 },
    { cx: 560, cz: -120, rx: 60, rz: 58, n: 30 },
    { cx: -350, cz: 112, rx: 76, rz: 40, n: 38 },
  ]
  const avoid: Array<[number, number, number]> = [
    [-400, 185, 98], // airport
    [-300, 60, 34], // rcde stadium
    [-230, 135, 80], // montjuïc
  ]
  const wall = ['#e4d8c2', '#ddcfb4', '#e9dcc4', '#d8c9ab']
  const roofs = ['#c26a45', '#b85f3d', '#cf7a52', '#a9583a']
  const out: TownHouse[] = []
  for (const cl of clusters) {
    for (let k = 0; k < cl.n; k++) {
      const a = rng() * Math.PI * 2
      const rr = Math.sqrt(rng())
      const x = cl.cx + Math.cos(a) * cl.rx * rr
      const z = cl.cz + Math.sin(a) * cl.rz * rr
      if (z > coastZ(x) - 14) continue // keep well inland of the shoreline
      if (avoid.some(([ax, az, ar]) => Math.hypot(x - ax, z - az) < ar)) continue
      out.push({
        x,
        z,
        w: 4 + rng() * 4,
        d: 4 + rng() * 4,
        h: 3 + rng() * 4,
        rot: (rng() - 0.5) * 0.7,
        c: new THREE.Color(wall[Math.floor(rng() * wall.length)]),
        roof: new THREE.Color(roofs[Math.floor(rng() * roofs.length)]),
      })
    }
  }
  return out
})()

function PeripheralTowns() {
  const boxRef = useRef<THREE.InstancedMesh>(null)
  const roofRef = useRef<THREE.InstancedMesh>(null)
  const roofGeom = useMemo(() => {
    const g = new THREE.ConeGeometry(1, 1, 4)
    g.rotateY(Math.PI / 4)
    g.translate(0, 0.5, 0)
    return g
  }, [])
  useLayoutEffect(() => {
    const box = boxRef.current
    const roof = roofRef.current
    if (!box || !roof) return
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const up = new THREE.Vector3(0, 1, 0)
    TOWN_ITEMS.forEach((b, i) => {
      q.setFromAxisAngle(up, b.rot)
      m.compose(new THREE.Vector3(b.x, b.h / 2, b.z), q, new THREE.Vector3(b.w, b.h, b.d))
      box.setMatrixAt(i, m)
      box.setColorAt(i, b.c)
      m.compose(new THREE.Vector3(b.x, b.h, b.z), q, new THREE.Vector3(b.w * 0.72, 1.6 + b.h * 0.16, b.d * 0.72))
      roof.setMatrixAt(i, m)
      roof.setColorAt(i, b.roof)
    })
    box.instanceMatrix.needsUpdate = true
    roof.instanceMatrix.needsUpdate = true
    if (box.instanceColor) box.instanceColor.needsUpdate = true
    if (roof.instanceColor) roof.instanceColor.needsUpdate = true
  }, [roofGeom])
  return (
    <group>
      <instancedMesh ref={boxRef} args={[undefined, undefined, TOWN_ITEMS.length]}>
        <boxGeometry />
        <meshLambertMaterial map={oldTownTexture()} />
      </instancedMesh>
      <instancedMesh ref={roofRef} args={[roofGeom, undefined, TOWN_ITEMS.length]}>
        <meshLambertMaterial flatShading />
      </instancedMesh>
    </group>
  )
}

export default function City() {
  return (
    <group>
      <Ground />
      <Hills />
      <Roads />
      <EixampleBlocks />
      <RoofClutter />
      <ScatterBlocks />
      <HipRoofs />
      <PeripheralTowns />
      <Trees />
      <Clouds />
    </group>
  )
}
