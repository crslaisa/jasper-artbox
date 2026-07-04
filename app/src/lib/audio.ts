function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined') return undefined
  for (const t of ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm']) {
    if (MediaRecorder.isTypeSupported(t)) return t
  }
  return undefined
}

export class VoiceRecorder {
  private recorder: MediaRecorder | null = null
  private stream: MediaStream | null = null
  private chunks: BlobPart[] = []
  private startedAt = 0

  get supported(): boolean {
    return typeof MediaRecorder !== 'undefined' && !!navigator.mediaDevices?.getUserMedia
  }

  async start(): Promise<void> {
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mimeType = pickMimeType()
    this.recorder = new MediaRecorder(this.stream, mimeType ? { mimeType } : undefined)
    this.chunks = []
    this.recorder.ondataavailable = (e) => {
      if (e.data.size > 0) this.chunks.push(e.data)
    }
    this.recorder.start()
    this.startedAt = Date.now()
  }

  /** Stops recording and returns the audio blob plus duration in seconds. */
  stop(): Promise<{ blob: Blob; duration: number }> {
    return new Promise((resolve, reject) => {
      const rec = this.recorder
      if (!rec) return reject(new Error('not recording'))
      const duration = Math.round((Date.now() - this.startedAt) / 1000)
      rec.onstop = () => {
        const blob = new Blob(this.chunks, { type: rec.mimeType || 'audio/mp4' })
        this.cleanup()
        resolve({ blob, duration })
      }
      rec.stop()
    })
  }

  cancel(): void {
    try {
      this.recorder?.stop()
    } catch {
      /* already stopped */
    }
    this.cleanup()
  }

  private cleanup(): void {
    this.stream?.getTracks().forEach((t) => t.stop())
    this.stream = null
    this.recorder = null
  }
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}
