interface Props {
  seed?: number
  accent?: string
  bars?: number
  active?: boolean
}

/** Decorative hand-drawn waveform bars. */
export function Waveform({ seed = 7, accent = 'var(--coral)', bars = 14, active = false }: Props) {
  const heights = Array.from({ length: bars }, (_, i) => 30 + ((seed * (i + 3) * 31) % 70))
  return (
    <div className="wave" aria-hidden>
      {heights.map((h, i) => (
        <span
          key={i}
          style={{
            height: `${h}%`,
            background: i % 3 === 2 ? accent : 'var(--ink)',
            opacity: active ? 1 : 0.9,
          }}
        />
      ))}
    </div>
  )
}
