export interface DetectedPlace {
  place: string
  lat: number | null
  lng: number | null
}

const EMPTY: DetectedPlace = { place: '', lat: null, lng: null }

/** Best-effort location detection; resolves with empty values on any failure. */
export function detectPlace(): Promise<DetectedPlace> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(EMPTY)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        let place = ''
        try {
          const r = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
          )
          const j = await r.json()
          place = j.city || j.locality || j.principalSubdivision || j.countryName || ''
        } catch {
          /* offline or API down — keep coordinates only */
        }
        resolve({ place, lat: latitude, lng: longitude })
      },
      () => resolve(EMPTY),
      { timeout: 8000, maximumAge: 10 * 60 * 1000 },
    )
  })
}
