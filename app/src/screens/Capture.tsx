import { useEffect, useRef, useState } from 'react'
import { db } from '../db'
import { processPhoto } from '../lib/image'
import { VoiceRecorder, formatDuration } from '../lib/audio'
import { detectPlace } from '../lib/geo'
import { useObjectUrl, formatDateTime } from '../lib/ui'
import { Waveform } from '../components/Waveform'
import type { Screen } from '../nav'

interface Props {
  go: (s: Screen) => void
}

export function Capture({ go }: Props) {
  const [photoFile, setPhotoFile] = useState<Blob | null>(null)
  const [rotation, setRotation] = useState<0 | 90 | 180 | 270>(0)
  const [title, setTitle] = useState('')
  const [place, setPlace] = useState('')
  const [coords, setCoords] = useState<{ lat: number | null; lng: number | null }>({
    lat: null,
    lng: null,
  })
  const [locating, setLocating] = useState(true)
  const [takenAt] = useState(() => Date.now())

  const recorderRef = useRef(new VoiceRecorder())
  const [recording, setRecording] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [audio, setAudio] = useState<{ blob: Blob; duration: number } | null>(null)
  const [saving, setSaving] = useState(false)

  const cameraRef = useRef<HTMLInputElement>(null)
  const albumRef = useRef<HTMLInputElement>(null)
  const photoUrl = useObjectUrl(photoFile)
  const audioUrl = useObjectUrl(audio?.blob ?? null)

  useEffect(() => {
    let cancelled = false
    detectPlace().then((d) => {
      if (cancelled) return
      setPlace((prev) => prev || d.place)
      setCoords({ lat: d.lat, lng: d.lng })
      setLocating(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!recording) return
    const t = setInterval(() => setElapsed((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [recording])

  useEffect(() => {
    const rec = recorderRef.current
    return () => rec.cancel()
  }, [])

  const toggleRecording = async () => {
    if (recording) {
      const result = await recorderRef.current.stop()
      setAudio(result)
      setRecording(false)
    } else {
      try {
        setAudio(null)
        setElapsed(0)
        await recorderRef.current.start()
        setRecording(true)
      } catch {
        alert('Could not use the microphone. Check permissions and try again!')
      }
    }
  }

  const save = async () => {
    if (!photoFile || saving) return
    setSaving(true)
    try {
      const { photo, thumb } = await processPhoto(photoFile, rotation)
      const id = await db.paintings.add({
        title: title.trim(),
        story: '',
        place: place.trim(),
        lat: coords.lat,
        lng: coords.lng,
        takenAt,
        loved: 0,
        onWall: 0,
        createdAt: Date.now(),
        audioDuration: audio?.duration ?? null,
        photo: await photo.arrayBuffer(),
        photoType: 'image/jpeg',
        thumb: await thumb.arrayBuffer(),
        thumbType: 'image/jpeg',
        audio: audio ? await audio.blob.arrayBuffer() : null,
        audioType: audio?.blob.type ?? null,
        // Dexie fills in the auto-increment id
      } as Parameters<typeof db.paintings.add>[0])
      go({ name: 'detail', id: id as number })
    } catch (e) {
      alert(`Could not save: ${e instanceof Error ? e.message : e}`)
      setSaving(false)
    }
  }

  const onPickPhoto = (file: File | undefined) => {
    if (file) {
      setPhotoFile(file)
      setRotation(0)
    }
  }

  const corners = (
    <>
      <span className="corner" style={{ top: 12, left: 12, borderLeft: '3px solid', borderTop: '3px solid', borderRadius: '7px 0 0 0' }} />
      <span className="corner" style={{ top: 12, right: 12, borderRight: '3px solid', borderTop: '3px solid', borderRadius: '0 7px 0 0' }} />
      <span className="corner" style={{ bottom: 12, left: 12, borderLeft: '3px solid', borderBottom: '3px solid', borderRadius: '0 0 0 7px' }} />
      <span className="corner" style={{ bottom: 12, right: 12, borderRight: '3px solid', borderBottom: '3px solid', borderRadius: '0 0 7px 0' }} />
    </>
  )

  return (
    <div>
      <div className="screen-title">New Masterpiece!</div>

      <div className="capture-cols">
        <div className="col-photo">
          <div className={`viewfinder${photoUrl ? ' has-photo' : ''}`}>
            {photoUrl ? (
              <>
                <img
                  src={photoUrl}
                  alt="Your new masterpiece"
                  style={{
                    transform: `rotate(${rotation}deg)${rotation % 180 !== 0 ? ' scale(0.72)' : ''}`,
                    transition: 'transform .2s',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: 14,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'var(--green)',
                    color: '#fff',
                    fontSize: 15,
                    padding: '3px 14px',
                    borderRadius: 13,
                    border: '2px solid var(--ink)',
                  }}
                >
                  ✓ Snapped!
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--muted)', padding: 20 }}>
                <div style={{ fontSize: 46 }}>📷</div>
                <div style={{ fontFamily: 'var(--marker)', fontSize: 19, color: 'var(--ink)', marginTop: 8 }}>
                  Show me your painting!
                </div>
                <div style={{ fontSize: 15, marginTop: 4 }}>Snap a photo or pick one from the album</div>
              </div>
            )}
            {corners}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 26,
              padding: '16px 0 0',
            }}
          >
            <button
              style={{ fontSize: 16, color: 'var(--muted)' }}
              onClick={() => setPhotoFile(null)}
              disabled={!photoFile}
            >
              Retake
            </button>
            <button
              style={{ fontSize: 16, color: photoFile ? 'var(--ink)' : 'var(--muted)' }}
              onClick={() => setRotation((r) => ((r + 90) % 360) as 0 | 90 | 180 | 270)}
              disabled={!photoFile}
            >
              ↻ Rotate
            </button>
            <button
              aria-label="Take photo"
              onClick={() => cameraRef.current?.click()}
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: '#fff',
                border: '3px solid var(--ink)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: '50%',
                  background: 'var(--yellow)',
                  border: '2px solid var(--ink)',
                }}
              />
            </button>
            <button style={{ fontSize: 16, color: 'var(--muted)' }} onClick={() => albumRef.current?.click()}>
              Album
            </button>
          </div>
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: 'none' }}
            onChange={(e) => onPickPhoto(e.target.files?.[0])}
          />
          <input
            ref={albumRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => onPickPhoto(e.target.files?.[0])}
          />
        </div>

        <div className="col-form">
          <div className="panel">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 12,
              }}
            >
              <span style={{ fontSize: 19 }}>Tell me the story!</span>
              <span style={{ fontSize: 16, color: 'var(--coral)' }}>
                {recording ? formatDuration(elapsed) : audio ? formatDuration(audio.duration) : ''}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <button
                aria-label={recording ? 'Stop recording' : 'Start recording'}
                onClick={toggleRecording}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'var(--coral)',
                  border: '3px solid var(--ink)',
                  flex: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 0 rgba(26,26,26,.2)',
                }}
              >
                {recording ? (
                  <span style={{ width: 18, height: 18, background: '#fff', borderRadius: 4 }} />
                ) : (
                  <span style={{ width: 20, height: 20, background: '#fff', borderRadius: '50%' }} />
                )}
              </button>
              {audio && audioUrl && !recording ? (
                <audio src={audioUrl} controls style={{ flex: 1, minWidth: 0, height: 40 }} />
              ) : (
                <Waveform seed={recording ? elapsed + 3 : 7} active={recording} />
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 14 }}>
            <div className="field-card" style={{ flex: 1, background: '#EAF6FF' }}>
              <div className="field-label">
                <span className="pin" style={{ width: 14, height: 14 }} />
                Where
                {place && <span style={{ marginLeft: 'auto', color: 'var(--green)', fontSize: 15 }}>✓</span>}
              </div>
              <input
                value={place}
                placeholder={locating ? 'Finding you…' : 'Type a place'}
                onChange={(e) => setPlace(e.target.value)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  fontSize: 16,
                  width: '100%',
                  outline: 'none',
                  padding: 0,
                }}
              />
            </div>
            <div className="field-card" style={{ flex: 1, background: '#FFF3D6' }}>
              <div className="field-label">
                🕐 When
                <span style={{ marginLeft: 'auto', color: 'var(--green)', fontSize: 15 }}>✓</span>
              </div>
              <div style={{ fontSize: 16, lineHeight: 1.1 }}>{formatDateTime(takenAt)}</div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 15, color: 'var(--muted)', marginBottom: 7 }}>
              Name your masterpiece
            </div>
            <input
              className="text-input"
              value={title}
              placeholder="The Happy Flower"
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <button
            className="big-btn"
            style={{ background: 'var(--yellow)', marginTop: 'auto' }}
            onClick={save}
            disabled={!photoFile || saving || recording}
          >
            {saving ? 'Putting it in…' : 'Put it in my box! ★'}
          </button>
        </div>
      </div>
    </div>
  )
}
