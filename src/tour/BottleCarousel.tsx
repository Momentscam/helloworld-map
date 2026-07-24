import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import type { StopBottle } from './stops'
import { track } from '../lib/analytics'

/** framed lifestyle photo cards: every shot of every available bottle becomes a
    slide, cross-fading with arrows + pill-dot pagination and 5 s auto-advance.
    Clicking the photo opens a full-size lightbox to inspect the label. */
export default function BottleCarousel({ bottles }: { bottles: StopBottle[] }) {
  const [index, setIndex] = useState(0)
  const [hovered, setHovered] = useState(false)
  const [zoom, setZoom] = useState<{ img: string; name: string } | null>(null)
  const slides = useMemo(
    () => bottles.flatMap((b) => b.imgs.map((img) => ({ img, name: b.name }))),
    [bottles],
  )
  const n = slides.length

  // auto-advance, paused on hover and while the lightbox is open
  useEffect(() => {
    if (n < 2 || hovered || zoom) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = window.setInterval(() => setIndex((v) => (v + 1) % n), 5000)
    return () => window.clearInterval(id)
    // `index` in deps restarts the 5 s clock after manual navigation too
  }, [n, hovered, index, zoom])

  // Escape closes the lightbox
  useEffect(() => {
    if (!zoom) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        setZoom(null)
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [zoom])

  if (n === 0) return null

  const openZoom = () => {
    setZoom(slides[index])
    track('bottle_photo_zoomed', { bottle: slides[index].name })
  }

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
            onClick={openZoom}
          />
        ))}
        <button className="bc-expand" onClick={openZoom} aria-label="View bottle larger">
          ⤢
        </button>
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

      {zoom &&
        createPortal(
          <div
            className="bc-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={`${zoom.name} bottle`}
            onClick={() => setZoom(null)}
          >
            <button className="bc-lightbox-close" aria-label="Close">
              ✕
            </button>
            <img src={zoom.img} alt={zoom.name} onClick={(e) => e.stopPropagation()} />
          </div>,
          document.body,
        )}
    </div>
  )
}
