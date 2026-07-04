import Dexie, { type EntityTable } from 'dexie'

export interface Painting {
  id: number
  title: string
  photo: Blob
  thumb: Blob
  audio: Blob | null
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

export function requestPersistentStorage() {
  if (navigator.storage?.persist) {
    navigator.storage.persist().catch(() => {})
  }
}
