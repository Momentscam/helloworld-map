import type { ThreeEvent } from '@react-three/fiber'

/* little surprises hidden around the board — procedural audio (no assets)
   and a shared hover cursor so clickable delights invite the click */

export const pointerCursor = {
  onPointerOver: (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    document.body.style.cursor = 'pointer'
  },
  onPointerOut: () => {
    document.body.style.cursor = ''
  },
}

let ctx: AudioContext | null = null
const audio = () => {
  ctx ??= new AudioContext()
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

const noiseBuffer = (ac: AudioContext, seconds: number) => {
  const buf = ac.createBuffer(1, Math.ceil(ac.sampleRate * seconds), ac.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  return buf
}

/** stadium roar — a swell of band-passed noise, like ninety thousand people at once */
export function crowdRoar(duration = 3.8) {
  const ac = audio()
  const t0 = ac.currentTime
  const src = ac.createBufferSource()
  src.buffer = noiseBuffer(ac, duration)
  const bp = ac.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = 850
  bp.Q.value = 0.6
  const g = ac.createGain()
  g.gain.setValueAtTime(0.001, t0)
  g.gain.exponentialRampToValueAtTime(0.38, t0 + 0.3)
  g.gain.setValueAtTime(0.38, t0 + duration * 0.55)
  g.gain.exponentialRampToValueAtTime(0.001, t0 + duration)
  src.connect(bp)
  bp.connect(g)
  g.connect(ac.destination)
  src.start(t0)
  src.stop(t0 + duration)
}

/** firework — a low thump plus a high crackle, delayed to match the visual burst */
export function fireworkPop(delay = 0) {
  const ac = audio()
  const t0 = ac.currentTime + delay
  const osc = ac.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(120, t0)
  osc.frequency.exponentialRampToValueAtTime(40, t0 + 0.35)
  const og = ac.createGain()
  og.gain.setValueAtTime(0.4, t0)
  og.gain.exponentialRampToValueAtTime(0.001, t0 + 0.4)
  osc.connect(og)
  og.connect(ac.destination)
  osc.start(t0)
  osc.stop(t0 + 0.45)
  const src = ac.createBufferSource()
  src.buffer = noiseBuffer(ac, 0.55)
  const hp = ac.createBiquadFilter()
  hp.type = 'highpass'
  hp.frequency.value = 2500
  const ng = ac.createGain()
  ng.gain.setValueAtTime(0.13, t0 + 0.03)
  ng.gain.exponentialRampToValueAtTime(0.001, t0 + 0.55)
  src.connect(hp)
  hp.connect(ng)
  ng.connect(ac.destination)
  src.start(t0 + 0.03)
  src.stop(t0 + 0.6)
}

/** soft rain patter under a clicked cloud */
export function rainPatter(duration = 2.6) {
  const ac = audio()
  const t0 = ac.currentTime
  const src = ac.createBufferSource()
  src.buffer = noiseBuffer(ac, duration)
  const hp = ac.createBiquadFilter()
  hp.type = 'highpass'
  hp.frequency.value = 3800
  const g = ac.createGain()
  g.gain.setValueAtTime(0.001, t0)
  g.gain.exponentialRampToValueAtTime(0.1, t0 + 0.3)
  g.gain.setValueAtTime(0.1, t0 + duration - 0.5)
  g.gain.exponentialRampToValueAtTime(0.001, t0 + duration)
  src.connect(hp)
  hp.connect(g)
  g.connect(ac.destination)
  src.start(t0)
  src.stop(t0 + duration)
}
