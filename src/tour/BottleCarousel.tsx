import { useEffect, useMemo, useState } from 'react'
import type { StopBottle } from './stops'

/** framed lifestyle photo cards: every shot of every available bottle becomes a
    slide, cross-fading with arrows + pill-dot pagination and 5 s auto-advance */
export default function BottleCarousel({ bottles }: { bottles: StopBottle[] }) {
  const [index, setIndex] = useState(0)
  const [hovered, setHovered] = useState(false)
  const slides = useMemo(
    () => bottles.flatMap((b) => b.imgs.map((img) => ({ img, name: b.name }))),
    [bottles],
  )
  const n = slides.length

  useEffect(() => {
    if (n < 2 || hovered) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = window.setInterval(() => setIndex((v) => (v + 1) % n), 5000)
    return () => window.clearInterval(id)
    // `index` in deps restarts the 5 s clock after manual navigation too
  }, [n, hovered, index])

  if (n === 0) return null

  return (
    <div className="sc-bottles">
      <div className="sc-bottle-kicker">AVAILABLE BOTTLES</div>
      <div
        className="bc-stage"
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        {slides.map((s, k) => (
          <img
            key={s.img}
            className={`bc-img${k === index ? ' on' : ''}`}
            src={s.img}
            alt={k === index ? s.name : ''}
            loading="lazy"
          />
        ))}
        {n > 1 && (
          <>
            <button
              className="bc-arrow left"
              onClick={() => setIndex((index - 1 + n) % n)}
              aria-label="Previous bottle"
            >
              ‹
            </button>
            <button
              className="bc-arrow right"
              onClick={() => setIndex((index + 1) % n)}
              aria-label="Next bottle"
            >
              ›
            </button>
          </>
        )}
      </div>
      {n > 1 && (
        <div className="bc-dots" role="tablist" aria-label="Bottles">
          {slides.map((s, k) => (
            <button
              key={s.img}
              className={`bc-dot${k === index ? ' on' : ''}`}
              onClick={() => setIndex(k)}
              aria-label={`Show ${s.name}`}
              aria-selected={k === index}
              role="tab"
            />
          ))}
        </div>
      )}
    </div>
  )
}
