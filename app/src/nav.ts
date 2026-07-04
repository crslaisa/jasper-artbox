export type Screen =
  | { name: 'gallery' }
  | { name: 'favorites' }
  | { name: 'wall' }
  | { name: 'capture' }
  | { name: 'detail'; id: number }
