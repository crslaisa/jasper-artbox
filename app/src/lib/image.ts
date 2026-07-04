async function loadImage(blob: Blob): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(blob)
  try {
    const img = new Image()
    img.src = url
    await img.decode()
    return img
  } finally {
    // revoke after decode; the pixels are already in memory
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
}

function toJpeg(img: HTMLImageElement, maxSide: number, quality: number): Promise<Blob> {
  const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight))
  const w = Math.round(img.naturalWidth * scale)
  const h = Math.round(img.naturalHeight * scale)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0, w, h)
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('toBlob failed'))),
      'image/jpeg',
      quality,
    )
  })
}

/** Compress a camera/album photo into a full-size JPEG and a small thumbnail. */
export async function processPhoto(file: Blob): Promise<{ photo: Blob; thumb: Blob }> {
  const img = await loadImage(file)
  const photo = await toJpeg(img, 1600, 0.85)
  const thumb = await toJpeg(img, 400, 0.8)
  return { photo, thumb }
}
