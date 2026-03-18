import { create } from 'zustand'
import type { Station, TrackMetadata, PlayerState } from '../types'

interface PlayerActions {
  setCurrentStation: (station: Station | null) => void
  setCurrentTrack: (track: TrackMetadata | null) => void
  setIsPlaying: (isPlaying: boolean) => void
  setVolume: (volume: number) => void
}

type PlayerStore = PlayerState & PlayerActions

export const usePlayerStore = create<PlayerStore>((set) => ({
  currentStation: null,
  currentTrack: null,
  isPlaying: false,
  volume: 100,

  setCurrentStation: (station) => set({ currentStation: station }),
  setCurrentTrack: (track) => set({ currentTrack: track }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setVolume: (volume) => {
    set({ volume })
  },
}))
