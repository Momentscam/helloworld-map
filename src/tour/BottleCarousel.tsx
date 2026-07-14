import { useEffect, useState } from 'react'
import type { StopBottle } from './stops'

/** one bottle at a time on an open shelf: cross-fade between slides,
    arrows + pill-dot pagination, 5 s auto-advance (paused on hover) */
export default function BottleCarousel({ bottles }: { bottles: StopBottle[] }) {
  const [index, setIndex] = useState(0)
  const [hovered, setHovered] = useState(false)
  const n = bottles.length

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
        {n > 1 && (
          <button
            className="bc-arrow left"
            onClick={() => setIndex((index - 1 + n) % n)}
            aria-label="Previous bottle"
          >
            ‹
          </button>
        )}
        <div className="bc-shelf" aria-hidden="true" />
        {bottles.map((b, k) => (
          <img
            key={b.name + k}
            className={`bc-img${k === index ? ' on' : ''}`}
            src={b.img}
            alt={k === index ? b.name : ''}
            loading="lazy"
          />
        ))}
        {n > 1 && (
          <button
            className="bc-arrow right"
            onClick={() => setIndex((index + 1) % n)}
            aria-label="Next bottle"
          >
            ›
          </button>
        )}
      </div>
      {n > 1 && (
        <div className="bc-dots" role="tablist" aria-label="Bottles">
          {bottles.map((b, k) => (
            <button
              key={b.name + k}
              className={`bc-dot${k === index ? ' on' : ''}`}
              onClick={() => setIndex(k)}
              aria-label={`Show ${b.name}`}
              aria-selected={k === index}
              role="tab"
            />
          ))}
        </div>
      )}
    </div>
  )
}
