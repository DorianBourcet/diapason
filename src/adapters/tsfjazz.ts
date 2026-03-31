import type { Station, TrackMetadata } from '../types'
import { proxyUrl } from '../utils/proxyUrl'

export async function fetchMetadata(_station: Station): Promise<TrackMetadata> {
  const response = await fetch(proxyUrl('https://www.tsfjazz.com/player/qect'), { method: 'POST' })

  if (!response.ok) {
    throw new Error(`TSF Jazz API error: ${response.status}`)
  }

  const data = await response.json()
  const current = data.current

  if (!current) {
    throw new Error('No track currently playing')
  }

  return {
    title: current.title ? current.title.toLowerCase() : undefined,
    artist: current.artist ? current.artist : undefined,
    coverUrl: current.cover ?? undefined,
    startedAt: current.start_time ?? undefined,
    duration: current.duration ?? undefined,
  }
}
