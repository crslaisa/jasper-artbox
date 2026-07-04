import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { PaintingCard } from '../components/PaintingCard'
import type { Screen } from '../nav'

type Filter = 'all' | 'week' | 'loved'

interface Props {
  lovedOnly?: boolean
  go: (s: Screen) => void
}

export function Gallery({ lovedOnly = false, go }: Props) {
  const [filter, setFilter] = useState<Filter>('all')
  const effective: Filter = lovedOnly ? 'loved' : filter

  const paintings = useLiveQuery(async () => {
    const all = await db.paintings.orderBy('takenAt').reverse().toArray()
    if (effective === 'loved') return all.filter((p) => p.loved === 1)
    if (effective === 'week') {
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
      return all.filter((p) => p.takenAt >= weekAgo)
    }
    return all
  }, [effective])

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div className="screen-title">{lovedOnly ? 'Favorites' : 'My Gallery'}</div>
        {!lovedOnly && (
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className={`chip${filter === 'all' ? ' active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              className={`chip${filter === 'week' ? ' active' : ''}`}
              onClick={() => setFilter('week')}
            >
              This week
            </button>
            <button
              className={`chip${filter === 'loved' ? ' active' : ''}`}
              onClick={() => setFilter('loved')}
            >
              ♥ Loved
            </button>
          </div>
        )}
      </div>

      {paintings && paintings.length === 0 ? (
        <div className="empty-state">
          <div className="doodle">🖍️</div>
          <div className="line1">
            {effective === 'loved' ? 'No loved paintings yet!' : 'The box is empty!'}
          </div>
          <div style={{ fontSize: 17, marginTop: 6 }}>
            {effective === 'loved'
              ? 'Tap the ♥ on a painting you really really like.'
              : 'Tap “+ New Art” to put your first masterpiece in the box.'}
          </div>
        </div>
      ) : (
        <div className="card-grid">
          {paintings?.map((p) => (
            <PaintingCard key={p.id} painting={p} onOpen={(id) => go({ name: 'detail', id })} />
          ))}
        </div>
      )}
    </div>
  )
}
