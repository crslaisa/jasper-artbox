function loadImage(blob: Blob): Promise<HTMLImageElement> {
  // Uses onload instead of img.decode(): decode() can hang forever in hidden
  // tabs (Chromium) and misbehaves on some iOS Safari versions.
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      resolve(img)
      // revoke after the frame that draws it; pixels are already decoded
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('could not read this image'))
    }
    img.src = url
  })
}

function toJpeg(
  img: HTMLImageElement,
  maxSide: number,
  quality: number,
  rotate: 0 | 90 | 180 | 270,
): Promise<Blob> {
  const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight))
  const w = Math.round(img.naturalWidth * scale)
  const h = Math.round(img.naturalHeight * scale)
  const swap = rotate === 90 || rotate === 270
  const canvas = document.createElement('canvas')
  canvas.width = swap ? h : w
  canvas.height = swap ? w : h
  const ctx = canvas.getContext('2d')!
  ctx.translate(canvas.width / 2, canvas.height / 2)
  ctx.rotate((rotate * Math.PI) / 180)
  ctx.drawImage(img, -w / 2, -h / 2, w, h)
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('toBlob failed'))),
      'image/jpeg',
      quality,
    )
  })
}

/** Compress a camera/album photo into a full-size JPEG and a small thumbnail, optionally rotated. */
export async function processPhoto(
  file: Blob,
  rotate: 0 | 90 | 180 | 270 = 0,
): Promise<{ photo: Blob; thumb: Blob }> {
  const img = await loadImage(file)
  const photo = await toJpeg(img, 1600, 0.85, rotate)
  const thumb = await toJpeg(img, 400, 0.8, rotate)
  return { photo, thumb }
}
