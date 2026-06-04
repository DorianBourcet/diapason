import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Station,
  TrackMetadata,
  PlayerState,
  Theme,
  SortOrder,
  MetadataStatus,
} from '../types'

interface PlayerActions {
  setCurrentStation: (station: Station | null) => void
  setCurrentTrack: (track: TrackMetadata | null) => void
  setMetadataStatus: (status: MetadataStatus) => void
  setVolume: (volume: number) => void
  toggleMute: () => void
  selectStation: (station: Station) => void
  setTheme: (theme: Theme) => void
  setErrorMessage: (msg: string | null) => void
  // Playback state machine (semantic actions — prefer these over raw status writes)
  play: () => void
  stop: () => void
  reportPlaying: () => void
  reportLoading: () => void
  reportError: (msg: string) => void
  // Favorites
  toggleFavorite: (id: string) => void
  // Sort & filters (filters not persisted — session only)
  setSortOrder: (order: SortOrder) => void
  toggleGenreFilter: (genre: string) => void
  toggleCountryFilter: (country: string) => void
  clearFilters: () => void
  // Section collapse state
  setFavoritesCollapsed: (v: boolean) => void
  setStationsCollapsed: (v: boolean) => void
}

type PlayerStore = PlayerState & {
  muted: boolean
  previousVolume: number
  errorMessage: string | null
  favorites: string[]
  sortOrder: SortOrder
  genreFilters: string[]
  countryFilters: string[]
  favoritesCollapsed: boolean
  stationsCollapsed: boolean
} & PlayerActions

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      currentStation: null,
      currentTrack: null,
      status: 'stopped',
      metadataStatus: 'unavailable' as MetadataStatus,
      volume: 50,
      muted: false,
      previousVolume: 50,
      theme: 'system' as Theme,
      errorMessage: null,
      favorites: [],
      sortOrder: 'az' as SortOrder,
      genreFilters: [],
      countryFilters: [],
      favoritesCollapsed: false,
      stationsCollapsed: false,

      setCurrentStation: (station) => set({ currentStation: station }),
      setCurrentTrack: (track) => set({ currentTrack: track }),
      setMetadataStatus: (status) => set({ metadataStatus: status }),
      setVolume: (volume) => set({ volume, muted: volume === 0 }),
      toggleMute: () => {
        const { muted, volume, previousVolume } = get()
        if (muted) {
          set({ muted: false, volume: previousVolume > 0 ? previousVolume : 50 })
        } else {
          set({ muted: true, previousVolume: volume })
        }
      },

      setTheme: (theme: Theme) => set({ theme }),
      setErrorMessage: (msg) => set({ errorMessage: msg }),

      selectStation: (station: Station) => {
        const { status, currentStation } = get()
        if (station.id === currentStation?.id && (status === 'playing' || status === 'loading')) {
          return
        }
        set({
          currentStation: station,
          status: 'loading',
          currentTrack: null,
          metadataStatus: station.adapter ? 'pending' : 'unavailable',
          errorMessage: null,
        })
      },

      play: () => {
        const { status, currentStation } = get()
        if (!currentStation) return
        if (status === 'playing' || status === 'loading') return
        set({
          status: 'loading',
          metadataStatus: currentStation.adapter ? 'pending' : 'unavailable',
          errorMessage: null,
        })
      },
      stop: () => set({ status: 'stopped' }),
      reportPlaying: () => set({ status: 'playing' }),
      reportLoading: () => {
        if (get().status === 'playing') set({ status: 'loading' })
      },
      reportError: (msg: string) => set({ status: 'stopped', errorMessage: msg }),
      toggleFavorite: (id: string) => {
        const { favorites } = get()
        set({
          favorites: favorites.includes(id)
            ? favorites.filter((f) => f !== id)
            : [...favorites, id],
        })
      },

      setSortOrder: (order: SortOrder) => set({ sortOrder: order }),

      toggleGenreFilter: (genre: string) => {
        const { genreFilters } = get()
        set({
          genreFilters: genreFilters.includes(genre)
            ? genreFilters.filter((g) => g !== genre)
            : [...genreFilters, genre],
        })
      },

      toggleCountryFilter: (country: string) => {
        const { countryFilters } = get()
        set({
          countryFilters: countryFilters.includes(country)
            ? countryFilters.filter((c) => c !== country)
            : [...countryFilters, country],
        })
      },

      clearFilters: () => set({ genreFilters: [], countryFilters: [] }),

      setFavoritesCollapsed: (v: boolean) => set({ favoritesCollapsed: v }),
      setStationsCollapsed: (v: boolean) => set({ stationsCollapsed: v }),
    }),
    {
      name: 'diapason-store',
      partialize: (state) => ({
        currentStation: state.currentStation,
        volume: state.volume,
        theme: state.theme,
        favorites: state.favorites,
        sortOrder: state.sortOrder,
        favoritesCollapsed: state.favoritesCollapsed,
        stationsCollapsed: state.stationsCollapsed,
      }),
    },
  ),
)
