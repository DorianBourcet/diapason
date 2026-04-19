import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Station, TrackMetadata, PlayerState, PlaybackStatus, Theme } from '../types'

// Module-scoped cache for metadata keyed by station id
const metadataCache = new Map<string, TrackMetadata>()

interface PlayerActions {
  setCurrentStation: (station: Station | null) => void
  setCurrentTrack: (track: TrackMetadata | null) => void
  setStatus: (status: PlaybackStatus) => void
  setVolume: (volume: number) => void
  toggleMute: () => void
  selectStation: (station: Station) => void
  getCachedMetadata: (stationId: string) => TrackMetadata | undefined
  setCachedMetadata: (stationId: string, track: TrackMetadata) => void
  clearCachedMetadata: (stationId?: string) => void
  setTheme: (theme: Theme) => void
  setErrorMessage: (msg: string | null) => void
}

type PlayerStore = PlayerState & {
  muted: boolean
  previousVolume: number
  errorMessage: string | null
} & PlayerActions

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      currentStation: null,
      currentTrack: null,
      status: 'stopped',
      volume: 50,
      muted: false,
      previousVolume: 50,
      theme: 'system' as Theme,
      errorMessage: null,

      setCurrentStation: (station) => set({ currentStation: station }),
      setCurrentTrack: (track) => set({ currentTrack: track }),
      setStatus: (status) => set({ status }),
      setVolume: (volume) => set({ volume, muted: volume === 0 }),
      toggleMute: () => {
        const { muted, volume, previousVolume } = get()
        if (muted) {
          // Restore previous volume (minimum 10 to avoid staying at 0)
          set({ muted: false, volume: previousVolume > 0 ? previousVolume : 50 })
        } else {
          set({ muted: true, previousVolume: volume })
        }
      },

      setTheme: (theme: Theme) => set({ theme }),
      setErrorMessage: (msg) => set({ errorMessage: msg }),

      selectStation: (station: Station) => {
        if (get().status === 'playing' && station.id === get().currentStation?.id) return
        set({ currentStation: station, status: 'loading' })
      },
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
    }),
    {
      name: 'diapason-store',
      partialize: (state) => ({
        currentStation: state.currentStation,
        volume: state.volume,
        theme: state.theme,
      }),
    },
  ),
)

export function getAllCachedMetadata(): Record<string, TrackMetadata> {
  const out: Record<string, TrackMetadata> = {}
  for (const [k, v] of metadataCache.entries()) out[k] = v
  return out
}
