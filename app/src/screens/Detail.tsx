import { useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { decor, formatDate, formatDateTime, useObjectUrl } from '../lib/ui'
import { formatDuration } from '../lib/audio'
import { Waveform } from '../components/Waveform'
import { APP } from '../config'
import type { Screen } from '../nav'

interface Props {
  id: number
  go: (s: Screen) => void
}

export function Detail({ id, go }: Props) {
  const painting = useLiveQuery(() => db.paintings.get(id), [id])
  const photoUrl = useObjectUrl(painting?.photo)
  const audioUrl = useObjectUrl(painting?.audio)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [editingStory, setEditingStory] = useState(false)
  const [storyDraft, setStoryDraft] = useState('')

  if (painting === undefined) return null
  if (painting === null) {
    return (
      <div className="empty-state">
        <div className="line1">This painting flew away!</div>
        <button className="chip" style={{ marginTop: 14 }} onClick={() => go({ name: 'gallery' })}>
          Back to gallery
        </button>
      </div>
    )
  }

  const d = decor(painting.id)

  const togglePlay = () => {
    const el = audioRef.current
    if (!el) return
    if (playing) {
      el.pause()
    } else {
      el.play()
    }
  }

  const toggleLoved = () => db.paintings.update(id, { loved: painting.loved ? 0 : 1 })
  const toggleWall = () => db.paintings.update(id, { onWall: painting.onWall ? 0 : 1 })

  const share = async () => {
    const file = new File([painting.photo], `${painting.title || 'painting'}.jpg`, {
      type: 'image/jpeg',
    })
    const text = [
      painting.title || 'A masterpiece',
      `by ${APP.childName}${painting.place ? ` · ${painting.place}` : ''} · ${formatDate(painting.takenAt)}`,
    ].join('\n')
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], text })
      } catch {
        /* user cancelled */
      }
    } else {
      const url = URL.createObjectURL(painting.photo)
      const a = document.createElement('a')
      a.href = url
      a.download = `${painting.title || 'painting'}.jpg`
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 5000)
    }
  }

  const remove = async () => {
    if (confirm(`Take "${painting.title || 'this painting'}" out of the box forever?`)) {
      await db.paintings.delete(id)
      go({ name: 'gallery' })
    }
  }

  const saveStory = async () => {
    await db.paintings.update(id, { story: storyDraft.trim() })
    setEditingStory(false)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          style={{ display: 'flex', alignItems: 'center', gap: 12 }}
          onClick={() => go({ name: 'gallery' })}
        >
          <span className="round-btn" style={{ paddingBottom: 4, fontSize: 24 }}>
            ‹
          </span>
          <span style={{ fontSize: 17, color: 'var(--muted)' }}>Back to gallery</span>
        </button>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="round-btn"
            aria-label="Love this painting"
            onClick={toggleLoved}
            style={{ color: painting.loved ? '#fff' : 'var(--coral)', background: painting.loved ? 'var(--coral)' : '#fff' }}
          >
            ♥
          </button>
          <button className="round-btn" aria-label="Share" onClick={share}>
            ↗
          </button>
        </div>
      </div>

      <div className="detail-cols">
        <div className="col-hero">
          <div style={{ position: 'relative', transform: 'rotate(-2deg)', margin: '20px auto 0', maxWidth: 560 }}>
            <div
              style={{
                position: 'absolute',
                top: -14,
                left: 30,
                width: 84,
                height: 26,
                background: 'rgba(255,201,60,.85)',
                border: '1px dashed rgba(0,0,0,.13)',
                transform: 'rotate(-8deg)',
                zIndex: 2,
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: -14,
                right: 30,
                width: 84,
                height: 26,
                background: d.tape,
                border: '1px dashed rgba(0,0,0,.13)',
                transform: 'rotate(7deg)',
                zIndex: 2,
              }}
            />
            <div
              style={{
                background: '#fff',
                border: '3px solid var(--ink)',
                borderRadius: 10,
                padding: '14px 14px 18px',
                boxShadow: '7px 9px 0 rgba(26,26,26,.15)',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  border: '2px solid var(--ink)',
                  borderRadius: 5,
                  overflow: 'hidden',
                }}
              >
                {photoUrl && (
                  <img src={photoUrl} alt={painting.title} style={{ width: '100%', display: 'block' }} />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-info">
          <div style={{ fontFamily: 'var(--marker)', fontSize: 30 }}>
            {painting.title || 'Untitled masterpiece'}
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
            <span className="chip" style={{ background: '#FFF3D6' }}>
              🕐 {formatDate(painting.takenAt)}
            </span>
            {painting.place && (
              <span className="chip" style={{ background: '#EAF6FF', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                <span className="pin" style={{ width: 13, height: 13 }} />
                {painting.place}
              </span>
            )}
          </div>

          {painting.audio && audioUrl && (
            <div className="panel" style={{ marginTop: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <button
                  aria-label={playing ? 'Pause story' : 'Play story'}
                  onClick={togglePlay}
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: 'var(--green)',
                    border: '3px solid var(--ink)',
                    flex: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 0 rgba(26,26,26,.2)',
                  }}
                >
                  {playing ? (
                    <span style={{ display: 'flex', gap: 4 }}>
                      <span style={{ width: 5, height: 18, background: '#fff' }} />
                      <span style={{ width: 5, height: 18, background: '#fff' }} />
                    </span>
                  ) : (
                    <span
                      style={{
                        width: 0,
                        height: 0,
                        borderLeft: '17px solid #fff',
                        borderTop: '11px solid transparent',
                        borderBottom: '11px solid transparent',
                        marginLeft: 4,
                      }}
                    />
                  )}
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 17 }}>
                    {APP.childName}'s story
                    {painting.audioDuration ? ` · ${formatDuration(painting.audioDuration)}` : ''}
                  </div>
                  <Waveform seed={painting.id + 5} accent="var(--green)" active={playing} />
                </div>
              </div>
              <audio
                ref={audioRef}
                src={audioUrl}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onEnded={() => setPlaying(false)}
              />
            </div>
          )}

          <div style={{ marginTop: 18 }}>
            <div style={{ fontSize: 13, color: 'var(--faint)', letterSpacing: '.05em', marginBottom: 5 }}>
              ABOUT THIS PAINTING
            </div>
            {editingStory ? (
              <div>
                <textarea
                  className="text-input"
                  style={{ fontSize: 18, minHeight: 80, resize: 'vertical' }}
                  value={storyDraft}
                  placeholder={`What did ${APP.childName} say about it?`}
                  onChange={(e) => setStoryDraft(e.target.value)}
                  autoFocus
                />
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button className="chip active" onClick={saveStory}>
                    Save
                  </button>
                  <button className="chip" onClick={() => setEditingStory(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                style={{ textAlign: 'left', fontSize: 18, lineHeight: 1.35, width: '100%' }}
                onClick={() => {
                  setStoryDraft(painting.story)
                  setEditingStory(true)
                }}
              >
                {painting.story ? (
                  `“${painting.story}”`
                ) : (
                  <span style={{ color: 'var(--faint)' }}>Tap to write what {APP.childName} said…</span>
                )}
              </button>
            )}
            <div style={{ fontSize: 15, color: 'var(--muted)', marginTop: 9, lineHeight: 1.4 }}>
              By {APP.childName} (age {APP.childAge}).
              <br />
              {painting.place ? `${painting.place} · ` : ''}
              {formatDateTime(painting.takenAt)}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
            <button
              className="chip"
              style={{ flex: 1, background: painting.loved ? 'var(--pink)' : '#fff', padding: '13px', fontSize: 16 }}
              onClick={toggleLoved}
            >
              ♥ {painting.loved ? 'Loved' : 'Love it'}
            </button>
            <button
              className="chip"
              style={{ flex: 1.3, background: painting.onWall ? 'var(--yellow)' : '#fff', padding: '13px', fontSize: 16 }}
              onClick={toggleWall}
            >
              {painting.onWall ? '★ On the Wall' : '+ Add to Wall'}
            </button>
            <button className="chip" style={{ flex: 1, padding: '13px', fontSize: 16 }} onClick={share}>
              ↗ Share
            </button>
          </div>

          <button
            style={{ marginTop: 18, fontSize: 14, color: 'var(--faint)', textAlign: 'left' }}
            onClick={remove}
          >
            🗑 Take it out of the box
          </button>
        </div>
      </div>
    </div>
  )
}
