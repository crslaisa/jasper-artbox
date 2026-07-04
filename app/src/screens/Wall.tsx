import { useLiveQuery } from 'dexie-react-hooks'
import { db, type Painting } from '../db'
import { decor, useObjectUrl } from '../lib/ui'
import type { Screen } from '../nav'

interface Props {
  go: (s: Screen) => void
}

function WallItem({ painting, onOpen }: { painting: Painting; onOpen: () => void }) {
  const url = useObjectUrl(painting.thumb)
  const d = decor(painting.id)
  return (
    <button className="wall-item" style={{ transform: `rotate(${d.rot * 1.4}deg)` }} onClick={onOpen}>
      <span className="clip" />
      {url && <img src={url} alt={painting.title} />}
      <div className="wall-caption">{painting.title || 'Untitled'}</div>
    </button>
  )
}

export function Wall({ go }: Props) {
  const paintings = useLiveQuery(
    () => db.paintings.where('onWall').equals(1).sortBy('takenAt'),
    [],
  )

  const rows: Painting[][] = []
  if (paintings) {
    for (let i = 0; i < paintings.length; i += 4) rows.push(paintings.slice(i, i + 4))
  }

  return (
    <div>
      <div className="screen-title">The Painting Wall</div>
      <div style={{ fontSize: 16, color: 'var(--muted)', marginTop: 4 }}>
        The best of the best, hanging on the line ★
      </div>

      {paintings && paintings.length === 0 ? (
        <div className="empty-state">
          <div className="doodle">🎨</div>
          <div className="line1">The wall is waiting!</div>
          <div style={{ fontSize: 17, marginTop: 6 }}>
            Open a painting and tap “+ Add to Wall” to hang it here.
          </div>
          <button className="chip active" style={{ marginTop: 16 }} onClick={() => go({ name: 'gallery' })}>
            Go to gallery
          </button>
        </div>
      ) : (
        rows.map((row, i) => (
          <div key={i} className="wall-rope">
            <div className="rope" />
            <div className="wall-row" style={{ paddingTop: 8 }}>
              {row.map((p) => (
                <WallItem key={p.id} painting={p} onOpen={() => go({ name: 'detail', id: p.id })} />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
