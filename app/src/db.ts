import Dexie, { type EntityTable } from 'dexie'

/**
 * Binary data is stored as ArrayBuffer + mime type, NOT as Blob.
 * iOS Safari has long-standing bugs where Blobs stored in IndexedDB can come
 * back corrupted or mixed up after records are deleted and re-added.
 * ArrayBuffers round-trip reliably on every browser.
 */
export interface Painting {
  id: number
  title: string
  photo: ArrayBuffer
  photoType: string
  thumb: ArrayBuffer
  thumbType: string
  audio: ArrayBuffer | null
  audioType: string | null
  audioDuration: number | null
  story: string
  place: string
  lat: number | null
  lng: number | null
  takenAt: number
  loved: 0 | 1
  onWall: 0 | 1
  createdAt: number
}

export const db = new Dexie('jasper-artbox') as Dexie & {
  paintings: EntityTable<Painting, 'id'>
}

db.version(1).stores({
  paintings: '++id, takenAt, loved, onWall, createdAt',
})
db.version(2).stores({
  paintings: '++id, takenAt, loved, onWall, createdAt',
})

/** Rebuild a Blob from stored bytes. */
export function blobOf(buf: ArrayBuffer, type: string): Blob {
  return new Blob([buf], { type })
}

/**
 * One-time lazy migration for records created before the ArrayBuffer switch.
 * Runs outside the upgrade transaction because Blob.arrayBuffer() is async
 * and would kill an IndexedDB upgrade transaction.
 */
export async function migrateLegacyBlobs(): Promise<void> {
  try {
    const all = await db.paintings.toArray()
    for (const p of all) {
      const rec = p as unknown as Record<string, unknown>
      if (!(rec.photo instanceof Blob) && !(rec.thumb instanceof Blob) && !(rec.audio instanceof Blob)) {
        continue
      }
      try {
        const patch: Record<string, unknown> = {}
        if (rec.photo instanceof Blob) {
          patch.photoType = rec.photo.type || 'image/jpeg'
          patch.photo = await rec.photo.arrayBuffer()
        }
        if (rec.thumb instanceof Blob) {
          patch.thumbType = rec.thumb.type || 'image/jpeg'
          patch.thumb = await rec.thumb.arrayBuffer()
        }
        if (rec.audio instanceof Blob) {
          patch.audioType = rec.audio.type || 'audio/mp4'
          patch.audio = await rec.audio.arrayBuffer()
        }
        await db.paintings.update(p.id, patch as Partial<Painting>)
      } catch {
        // A record whose Blob is already corrupted cannot be recovered here;
        // leave it in place rather than losing the metadata.
      }
    }
  } catch {
    /* migration is best-effort */
  }
}

export function requestPersistentStorage() {
  if (navigator.storage?.persist) {
    navigator.storage.persist().catch(() => {})
  }
}
