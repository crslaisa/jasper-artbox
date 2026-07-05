import JSZip from 'jszip'
import { db, type Painting } from '../db'

interface BackupEntry {
  title: string
  story: string
  place: string
  lat: number | null
  lng: number | null
  takenAt: number
  loved: 0 | 1
  onWall: 0 | 1
  createdAt: number
  audioDuration: number | null
  photoFile: string
  thumbFile: string
  audioFile: string | null
  audioType: string | null
}

function audioExt(type: string): string {
  if (type.includes('mp4')) return 'm4a'
  if (type.includes('webm')) return 'webm'
  return 'bin'
}

export async function exportBackup(): Promise<void> {
  const paintings = await db.paintings.toArray()
  const zip = new JSZip()
  const entries: BackupEntry[] = []

  for (const p of paintings) {
    const photoFile = `photos/${p.id}.jpg`
    const thumbFile = `thumbs/${p.id}.jpg`
    zip.file(photoFile, p.photo)
    zip.file(thumbFile, p.thumb)
    let audioFile: string | null = null
    if (p.audio) {
      audioFile = `audio/${p.id}.${audioExt(p.audioType ?? '')}`
      zip.file(audioFile, p.audio)
    }
    entries.push({
      title: p.title,
      story: p.story,
      place: p.place,
      lat: p.lat,
      lng: p.lng,
      takenAt: p.takenAt,
      loved: p.loved,
      onWall: p.onWall,
      createdAt: p.createdAt,
      audioDuration: p.audioDuration,
      photoFile,
      thumbFile,
      audioFile,
      audioType: p.audioType,
    })
  }

  zip.file('metadata.json', JSON.stringify({ version: 2, exportedAt: Date.now(), entries }, null, 2))
  const blob = await zip.generateAsync({ type: 'blob' })
  const name = `art-box-backup-${new Date().toISOString().slice(0, 10)}.zip`

  const file = new File([blob], name, { type: 'application/zip' })
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: name })
      return
    } catch {
      /* user cancelled share — fall through to download */
    }
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
}

/** Imports a backup zip; returns how many paintings were added (deduped by createdAt+title). */
export async function importBackup(file: Blob): Promise<number> {
  const zip = await JSZip.loadAsync(file)
  const metaFile = zip.file('metadata.json')
  if (!metaFile) throw new Error('metadata.json missing — not an Art Box backup')
  const meta = JSON.parse(await metaFile.async('string')) as { entries: BackupEntry[] }

  const existing = await db.paintings.toArray()
  const seen = new Set(existing.map((p) => `${p.createdAt}|${p.title}`))
  let added = 0

  for (const e of meta.entries) {
    if (seen.has(`${e.createdAt}|${e.title}`)) continue
    const photoZip = zip.file(e.photoFile)
    const thumbZip = zip.file(e.thumbFile)
    if (!photoZip || !thumbZip) continue
    const photo = await photoZip.async('arraybuffer')
    const thumb = await thumbZip.async('arraybuffer')
    let audio: ArrayBuffer | null = null
    if (e.audioFile) {
      const audioZip = zip.file(e.audioFile)
      if (audioZip) audio = await audioZip.async('arraybuffer')
    }
    await db.paintings.add({
      title: e.title,
      story: e.story,
      place: e.place,
      lat: e.lat,
      lng: e.lng,
      takenAt: e.takenAt,
      loved: e.loved ? 1 : 0,
      onWall: e.onWall ? 1 : 0,
      createdAt: e.createdAt,
      audioDuration: e.audioDuration,
      photo,
      photoType: 'image/jpeg',
      thumb,
      thumbType: 'image/jpeg',
      audio,
      audioType: audio ? (e.audioType ?? 'audio/mp4') : null,
    } as Omit<Painting, 'id'> as Painting)
    added++
  }
  return added
}
