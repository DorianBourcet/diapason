import type { AdapterName } from '../adapters'

export type SortOrder = 'az' | 'za'

export interface Station {
  id: string
  name: string
  streamUrl: string
  websiteUrl?: string
  genres: string[]
  country: string
  adapter?: AdapterName
  adapterConfig?: Record<string, string>
}

export interface TrackMetadata {
  title?: string
  artist?: string
  album?: string
  coverUrl?: string
  startedAt?: number
  duration?: number
}

export type PlaybackStatus = 'playing' | 'stopped' | 'loading'

export type Theme = 'system' | 'light' | 'dark'

export interface PlayerState {
  currentStation: Station | null
  currentTrack: TrackMetadata | null
  status: PlaybackStatus
  volume: number
  theme: Theme
}
