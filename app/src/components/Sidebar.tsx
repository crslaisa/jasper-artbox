import { useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { exportBackup, importBackup } from '../lib/backup'
import type { Screen } from '../nav'

interface Props {
  screen: Screen
  go: (s: Screen) => void
}

export function Sidebar({ screen, go }: Props) {
  const count = useLiveQuery(() => db.paintings.count(), [], 0)
  const importRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)

  const doExport = async () => {
    setBusy(true)
    try {
      await exportBackup()
    } catch (e) {
      alert(`Backup failed: ${e instanceof Error ? e.message : e}`)
    } finally {
      setBusy(false)
    }
  }

  const doImport = async (file: File | undefined) => {
    if (!file) return
    setBusy(true)
    try {
      const added = await importBackup(file)
      alert(added > 0 ? `Welcome back! ${added} paintings restored.` : 'Nothing new to restore.')
    } catch (e) {
      alert(`Restore failed: ${e instanceof Error ? e.message : e}`)
    } finally {
      setBusy(false)
      if (importRef.current) importRef.current.value = ''
    }
  }

  const navGrid = (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }} aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <span key={i} style={{ width: 7, height: 7, background: 'var(--ink)' }} />
      ))}
    </div>
  )

  return (
    <nav className="sidebar">
      <div>
        <div className="logo">
          Jasper's
          <br />
          Art Box
        </div>
        <div className="logo-underline" />
      </div>

      <div className="profile">
        <div className="avatar">J</div>
        <div>
          <div style={{ fontSize: 18 }}>Jasper</div>
          <div style={{ fontSize: 13, color: 'var(--faint)' }}>age 6</div>
        </div>
      </div>

      <div className="nav">
        <button
          className={`nav-item${screen.name === 'gallery' ? ' active' : ''}`}
          onClick={() => go({ name: 'gallery' })}
        >
          {navGrid}
          Gallery
        </button>
        <button
          className={`nav-item${screen.name === 'wall' ? ' active' : ''}`}
          onClick={() => go({ name: 'wall' })}
        >
          <span style={{ display: 'flex', gap: 3 }} aria-hidden>
            <span style={{ width: 8, height: 11, border: '2px solid var(--ink)' }} />
            <span style={{ width: 8, height: 11, border: '2px solid var(--ink)' }} />
          </span>
          Wall
        </button>
        <button
          className={`nav-item${screen.name === 'favorites' ? ' active' : ''}`}
          onClick={() => go({ name: 'favorites' })}
        >
          <span style={{ color: 'var(--coral)', fontSize: 17 }} aria-hidden>
            ♥
          </span>
          Favorites
        </button>
      </div>

      <button className="new-art-btn" onClick={() => go({ name: 'capture' })}>
        + New Art
      </button>

      <div className="sidebar-footer">
        <div className="count">{count} masterpieces ★</div>
        <div className="grownups">
          <button onClick={doExport} disabled={busy}>
            Backup
          </button>
          <button onClick={() => importRef.current?.click()} disabled={busy}>
            Restore
          </button>
          <input
            ref={importRef}
            type="file"
            accept=".zip,application/zip"
            style={{ display: 'none' }}
            onChange={(e) => doImport(e.target.files?.[0])}
          />
        </div>
      </div>
    </nav>
  )
}
