import { create } from 'zustand'
import type { Station, TrackMetadata, PlayerState, PlaybackStatus } from '../types'

// Module-scoped cache for metadata keyed by station id
const metadataCache = new Map<string, TrackMetadata>()

interface PlayerActions {
  setCurrentStation: (station: Station | null) => void
  setCurrentTrack: (track: TrackMetadata | null) => void
  setStatus: (status: PlaybackStatus) => void
  setVolume: (volume: number) => void
  selectStation: (station: Station) => void
  getCachedMetadata: (stationId: string) => TrackMetadata | undefined
  setCachedMetadata: (stationId: string, track: TrackMetadata) => void
  clearCachedMetadata: (stationId?: string) => void
}

type PlayerStore = PlayerState & PlayerActions

export const usePlayerStore = create<PlayerStore>((set) => ({
  currentStation: null,
  currentTrack: null,
  status: 'stopped',
  volume: 100,

  setCurrentStation: (station) => set({ currentStation: station }),
  setCurrentTrack: (track) => set({ currentTrack: track }),
  setStatus: (status) => set({ status }),
  setVolume: (volume) => {
    set({ volume })
  },
  selectStation: (station: Station) => set({ currentStation: station, status: 'playing' }),

  // Cache accessors operate on the module-scoped Map (no reactive state)
  getCachedMetadata: (stationId: string) => {
    const val = metadataCache.get(stationId)
    if (val) {
      try {
        // eslint-disable-next-line no-console
        console.debug(`[metadata-cache] hit ${stationId}`, val)
      } catch (e) {
        // ignore
      }
    }
    return val
  },
  setCachedMetadata: (stationId: string, track: TrackMetadata) => {
    metadataCache.set(stationId, track)
    try {
      // helpful debug info in browser console during development
      // eslint-disable-next-line no-console
      console.debug(`[metadata-cache] set ${stationId}`, track)
    } catch (e) {
      // ignore
    }
  },
  clearCachedMetadata: (stationId?: string) => {
    if (stationId) metadataCache.delete(stationId)
    else metadataCache.clear()
  },
}))

// Lightweight helper for debugging: inspect cache contents
export function getAllCachedMetadata(): Record<string, TrackMetadata> {
  const out: Record<string, TrackMetadata> = {}
  for (const [k, v] of metadataCache.entries()) out[k] = v
  return out
}
