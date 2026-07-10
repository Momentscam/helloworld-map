import * as THREE from 'three'
import { mulberry32 } from './geo'

// Procedural canvas textures — crisp NearestFilter keeps the toy-like look.
// All bases are near-white so per-instance colors tint the walls, while
// windows stay dark enough to read through the tint.

function makeCanvas(w: number, h: number) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return c
}

function finish(canvas: HTMLCanvasElement, repeat: [number, number] = [1, 1], soft = false) {
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(...repeat)
  tex.magFilter = soft ? THREE.LinearFilter : THREE.NearestFilter
  tex.anisotropy = 4
  return tex
}

const cache = new Map<string, THREE.CanvasTexture>()
function cached(key: string, build: () => THREE.CanvasTexture) {
  let t = cache.get(key)
  if (!t) {
    t = build()
    cache.set(key, t)
  }
  return t
}

/** one window column, three floors + storefront — tiled around Eixample blocks */
export function facadeTexture(seed = 5) {
  return cached(`facade${seed}`, () => {
    const rng = mulberry32(seed)
    const c = makeCanvas(128, 192)
    const g = c.getContext('2d')!
    g.fillStyle = '#ffffff'
    g.fillRect(0, 0, 128, 192)
    // floor separators
    g.fillStyle = 'rgba(60,50,30,0.10)'
    ;[62, 126].forEach((y) => g.fillRect(0, y, 128, 3))
    // two upper floors × two window columns, sills, rails, the odd lit pane
    ;[14, 78].forEach((y) => {
      ;[18, 82].forEach((x) => {
        g.fillStyle = '#c9c0ab'
        g.fillRect(x - 4, y + 34, 36, 4) // sill
        g.fillStyle = rng() < 0.12 ? '#ffd08a' : '#26303c'
        g.fillRect(x, y, 28, 32)
        g.fillStyle = 'rgba(150,180,205,0.5)' // sky reflection
        g.fillRect(x, y, 28, 5)
        g.fillStyle = '#4a4438' // balcony rail
        g.fillRect(x - 6, y + 36, 40, 2)
      })
    })
    // ground floor: two storefronts + awnings
    ;[10, 74].forEach((x) => {
      const awning = ['#c96a4a', '#3d76c9', '#4aa46a', '#b0623a'][Math.floor(rng() * 4)]
      g.fillStyle = '#2c3540'
      g.fillRect(x, 150, 44, 38)
      g.fillStyle = 'rgba(150,180,205,0.35)'
      g.fillRect(x, 150, 44, 5)
      g.fillStyle = awning
      for (let k = x - 2; k < x + 44; k += 9) g.fillRect(k, 141, 5, 9)
    })
    return finish(c)
  })
}

/** small two-floor facade with shuttered windows — old town boxes (one tile per face) */
export function oldTownTexture(seed = 9) {
  return cached(`oldtown${seed}`, () => {
    const rng = mulberry32(seed)
    const c = makeCanvas(96, 96)
    const g = c.getContext('2d')!
    g.fillStyle = '#ffffff'
    g.fillRect(0, 0, 96, 96)
    const win = (x: number, y: number) => {
      g.fillStyle = rng() < 0.15 ? '#ffd08a' : '#2a333e'
      g.fillRect(x, y, 16, 20)
      // shutters
      g.fillStyle = ['#5d7250', '#6e5a44', '#4a5a68'][Math.floor(rng() * 3)]
      g.fillRect(x - 5, y, 5, 20)
      g.fillRect(x + 16, y, 5, 20)
      // little balcony
      g.fillStyle = '#403a30'
      g.fillRect(x - 4, y + 21, 24, 3)
    }
    win(16, 10)
    win(62, 10)
    win(16, 48)
    win(62, 48)
    // door
    g.fillStyle = '#4c3b2a'
    g.fillRect(40, 66, 18, 30)
    g.beginPath()
    g.arc(49, 66, 9, Math.PI, 0)
    g.fill()
    return finish(c)
  })
}

/** emissive night counterpart of facadeTexture — same window layout, warm lit panes on black */
export function facadeNightTexture(seed = 5) {
  return cached(`facadeNight${seed}`, () => {
    const rng = mulberry32(seed + 1000)
    const c = makeCanvas(128, 192)
    const g = c.getContext('2d')!
    g.fillStyle = '#000000'
    g.fillRect(0, 0, 128, 192)
    ;[14, 78].forEach((y) => {
      ;[18, 82].forEach((x) => {
        if (rng() < 0.62) {
          g.fillStyle = rng() < 0.25 ? '#ffe9b8' : '#ffc36b'
          g.globalAlpha = 0.45 + rng() * 0.55
          g.fillRect(x, y, 28, 32)
        }
      })
    })
    // storefronts stay bright late
    ;[10, 74].forEach((x) => {
      if (rng() < 0.8) {
        g.globalAlpha = 0.9
        g.fillStyle = '#ffd98a'
        g.fillRect(x, 150, 44, 38)
      }
    })
    g.globalAlpha = 1
    return finish(c)
  })
}

/** emissive night counterpart of oldTownTexture */
export function oldTownNightTexture(seed = 9) {
  return cached(`oldtownNight${seed}`, () => {
    const rng = mulberry32(seed + 1000)
    const c = makeCanvas(96, 96)
    const g = c.getContext('2d')!
    g.fillStyle = '#000000'
    g.fillRect(0, 0, 96, 96)
    ;[[16, 10], [62, 10], [16, 48], [62, 48]].forEach(([x, y]) => {
      if (rng() < 0.55) {
        g.fillStyle = rng() < 0.3 ? '#ffe9b8' : '#ffc36b'
        g.globalAlpha = 0.4 + rng() * 0.6
        g.fillRect(x, y, 16, 20)
      }
    })
    g.globalAlpha = 1
    return finish(c)
  })
}

/** mullioned glass for the terminal and towers (white base — tint via material color) */
export function glassTexture() {
  return cached('glass', () => {
    const c = makeCanvas(64, 64)
    const g = c.getContext('2d')!
    g.fillStyle = '#ffffff'
    g.fillRect(0, 0, 64, 64)
    g.fillStyle = 'rgba(120,160,185,0.45)'
    for (let i = 0; i < 64; i += 16) {
      g.fillRect(i, 0, 2, 64)
      g.fillRect(0, i, 64, 2)
    }
    g.fillStyle = 'rgba(190,220,240,0.5)'
    g.fillRect(0, 0, 64, 10)
    return finish(c, [4, 1])
  })
}

/** trencadís mosaic shimmer for Casa Batlló */
export function mosaicTexture() {
  return cached('mosaic', () => {
    const rng = mulberry32(77)
    const c = makeCanvas(128, 160)
    const g = c.getContext('2d')!
    const grad = g.createLinearGradient(0, 0, 0, 160)
    grad.addColorStop(0, '#9fb9d9')
    grad.addColorStop(0.45, '#a5cbd2')
    grad.addColorStop(1, '#d9d3c0')
    g.fillStyle = grad
    g.fillRect(0, 0, 128, 160)
    const dots = ['#4fa3c4', '#7fc9a8', '#b48fd9', '#e8d9a0', '#e0938a', '#ffffff']
    for (let i = 0; i < 260; i++) {
      g.fillStyle = dots[Math.floor(rng() * dots.length)]
      g.globalAlpha = 0.35 + rng() * 0.4
      const r = 1.5 + rng() * 3
      g.beginPath()
      g.arc(rng() * 128, rng() * 160, r, 0, Math.PI * 2)
      g.fill()
    }
    g.globalAlpha = 1
    // oval gallery windows
    ;[28, 64, 100].forEach((x) => {
      g.fillStyle = '#243038'
      g.beginPath()
      g.ellipse(x, 118, 11, 14, 0, 0, Math.PI * 2)
      g.fill()
      g.strokeStyle = '#f2ead6'
      g.lineWidth = 3.5
      g.stroke()
    })
    return finish(c)
  })
}

/** Torre Glòries LED skin */
export function ledTexture() {
  return cached('led', () => {
    const rng = mulberry32(12)
    const c = makeCanvas(64, 128)
    const g = c.getContext('2d')!
    g.fillStyle = '#31414f'
    g.fillRect(0, 0, 64, 128)
    const led = ['#39c1e8', '#e84b3a', '#3968e8', '#79e8d8', '#f2f2f2']
    for (let x = 2; x < 64; x += 7) {
      for (let y = 2; y < 128; y += 6) {
        if (rng() < 0.4) {
          g.fillStyle = led[Math.floor(rng() * led.length)]
          g.globalAlpha = 0.5 + rng() * 0.5
          g.fillRect(x, y, 3, 3)
        }
      }
    }
    g.globalAlpha = 1
    return finish(c, [4, 1])
  })
}

/** mottled deep-water texture — soft depth patches + wave flecks */
export function seaTexture() {
  return cached('sea', () => {
    const rng = mulberry32(404)
    const c = makeCanvas(256, 256)
    const g = c.getContext('2d')!
    g.fillStyle = '#3d7fb5'
    g.fillRect(0, 0, 256, 256)
    const blobs = ['#2e6ba3', '#28598c', '#4a8dc0', '#5a9cc9', '#356fa8', '#6aaad4']
    for (let i = 0; i < 46; i++) {
      g.fillStyle = blobs[Math.floor(rng() * blobs.length)]
      g.globalAlpha = 0.10 + rng() * 0.16
      g.beginPath()
      g.ellipse(rng() * 256, rng() * 256, 24 + rng() * 60, 14 + rng() * 36, rng() * Math.PI, 0, Math.PI * 2)
      g.fill()
    }
    // wave flecks
    g.globalAlpha = 0.5
    g.strokeStyle = '#8ec2e2'
    g.lineWidth = 1.2
    for (let i = 0; i < 60; i++) {
      const x = rng() * 256
      const y = rng() * 256
      g.beginPath()
      g.moveTo(x, y)
      g.quadraticCurveTo(x + 4, y - 1.5, x + 8 + rng() * 6, y)
      g.stroke()
    }
    g.globalAlpha = 1
    return finish(c, [1, 1], true)
  })
}

/** mottled hillside greens — fields, scrub and rocky patches */
export function terrainTexture(key = 'hill') {
  return cached(`terrain-${key}`, () => {
    const rng = mulberry32(606)
    const c = makeCanvas(256, 256)
    const g = c.getContext('2d')!
    g.fillStyle = '#8fb573'
    g.fillRect(0, 0, 256, 256)
    const patches = ['#7aa361', '#a3c184', '#6e9455', '#98bd7c', '#84a968', '#b3c78f']
    for (let i = 0; i < 42; i++) {
      g.fillStyle = patches[Math.floor(rng() * patches.length)]
      g.globalAlpha = 0.25 + rng() * 0.3
      g.beginPath()
      g.ellipse(rng() * 256, rng() * 256, 18 + rng() * 46, 12 + rng() * 30, rng() * Math.PI, 0, Math.PI * 2)
      g.fill()
    }
    // sandy clearings + rocky flecks
    for (let i = 0; i < 8; i++) {
      g.fillStyle = '#cfc39b'
      g.globalAlpha = 0.18 + rng() * 0.15
      g.beginPath()
      g.ellipse(rng() * 256, rng() * 256, 10 + rng() * 22, 7 + rng() * 14, rng() * Math.PI, 0, Math.PI * 2)
      g.fill()
    }
    g.globalAlpha = 0.35
    g.fillStyle = '#5e7a4a'
    for (let i = 0; i < 220; i++) {
      g.fillRect(rng() * 256, rng() * 256, 2 + rng() * 3, 2 + rng() * 3)
    }
    g.globalAlpha = 1
    return finish(c, [1, 1], true)
  })
}

/** market awning stripes */
export function stripeTexture(color = '#c94a3d') {
  return cached(`stripe${color}`, () => {
    const c = makeCanvas(64, 32)
    const g = c.getContext('2d')!
    g.fillStyle = '#f6f1e4'
    g.fillRect(0, 0, 64, 32)
    g.fillStyle = color
    for (let x = 0; x < 64; x += 16) g.fillRect(x, 0, 8, 32)
    return finish(c, [2, 1])
  })
}
