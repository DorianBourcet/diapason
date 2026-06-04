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
  refreshIn?: number
}

export type PlaybackStatus = 'playing' | 'stopped' | 'loading'

export type MetadataStatus = 'pending' | 'ready' | 'unavailable'

export type Theme = 'system' | 'light' | 'dark'

export interface PlayerState {
  currentStation: Station | null
  currentTrack: TrackMetadata | null
  status: PlaybackStatus
  metadataStatus: MetadataStatus
  volume: number
  theme: Theme
}
