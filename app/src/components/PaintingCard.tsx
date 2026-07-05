import type { Painting } from '../db'
import { decor, formatDateTime, useBufferUrl } from '../lib/ui'

interface Props {
  painting: Painting
  onOpen: (id: number) => void
}

export function PaintingCard({ painting, onOpen }: Props) {
  const url = useBufferUrl(painting.thumb, painting.thumbType)
  const d = decor(painting.id)

  return (
    <button
      className="p-card"
      style={{ transform: `rotate(${d.rot}deg)`, borderRadius: d.radius }}
      onClick={() => onOpen(painting.id)}
    >
      <div
        className="tape"
        style={{ background: d.tape, transform: `translateX(-50%) rotate(${d.tapeRot}deg)` }}
      />
      <div className="photo">{url && <img src={url} alt={painting.title} />}</div>
      <div className="card-title">
        {painting.title || 'Untitled masterpiece'}
        {painting.loved ? <span style={{ color: 'var(--coral)' }}> ♥</span> : null}
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 7, marginTop: 6 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {painting.place && (
            <div className="meta-line">
              <span className="pin" />
              <span
                style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
              >
                {painting.place}
              </span>
            </div>
          )}
          <div className="meta-sub">{formatDateTime(painting.takenAt)}</div>
        </div>
        {painting.audio && <span className="play-badge" />}
      </div>
    </button>
  )
}
