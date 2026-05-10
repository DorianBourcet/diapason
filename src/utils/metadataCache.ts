import type { TrackMetadata } from '../types'

const TTL_MS = 25_000

interface Entry {
  track: TrackMetadata
  cachedAt: number
}

const cache = new Map<string, Entry>()

function isFresh(entry: Entry): boolean {
  const { track, cachedAt } = entry
  if (track.startedAt && track.duration) {
    return track.startedAt + track.duration > Date.now() / 1000
  }
  return Date.now() - cachedAt < TTL_MS
}

export const metadataCache = {
  get(stationId: string): TrackMetadata | undefined {
    const entry = cache.get(stationId)
    if (!entry) return undefined
    if (!isFresh(entry)) {
      cache.delete(stationId)
      return undefined
    }
    return entry.track
  },
  set(stationId: string, track: TrackMetadata): void {
    cache.set(stationId, { track, cachedAt: Date.now() })
  },
  snapshot(): Record<string, TrackMetadata> {
    const out: Record<string, TrackMetadata> = {}
    for (const [k, v] of cache.entries()) out[k] = v.track
    return out
  },
}
