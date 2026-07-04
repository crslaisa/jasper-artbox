import { useEffect, useState } from 'react'

/** Stable object URL for a blob, revoked on unmount / blob change. */
export function useObjectUrl(blob: Blob | null | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    if (!blob) {
      setUrl(null)
      return
    }
    const u = URL.createObjectURL(blob)
    setUrl(u)
    return () => URL.revokeObjectURL(u)
  }, [blob])
  return url
}

export function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatDateTime(ts: number): string {
  const d = new Date(ts)
  const date = formatDate(ts)
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  return `${date} · ${time}`
}

const TAPE_COLORS = [
  'rgba(255,158,196,.82)',
  'rgba(79,176,232,.8)',
  'rgba(255,201,60,.85)',
  'rgba(107,191,89,.8)',
  'rgba(168,123,216,.8)',
]

/** Deterministic scrapbook decoration (tilt, tape color, corner radii) per painting. */
export function decor(id: number) {
  const rot = ((id * 37) % 5) - 2
  const tapeRot = ((id * 53) % 11) - 5
  const tape = TAPE_COLORS[id % TAPE_COLORS.length]
  const r = (n: number) => 11 + ((id * n) % 8)
  const radius = `${r(7)}px ${r(13)}px ${r(3)}px ${r(19)}px`
  return { rot, tapeRot, tape, radius }
}
