import { create } from 'zustand'
import type { Station, TrackMetadata, PlayerState, PlaybackStatus } from '../types'

interface PlayerActions {
  setCurrentStation: (station: Station | null) => void
  setCurrentTrack: (track: TrackMetadata | null) => void
  setStatus: (status: PlaybackStatus) => void
  setVolume: (volume: number) => void
  selectStation: (station: Station) => void
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
}))
