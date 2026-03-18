export interface Station {
  id: string
  name: string
  streamUrl: string
  adapter: 'radiofrance' | 'tsfjazz' | 'grrif'
  adapterConfig: Record<string, string>
}

export interface TrackMetadata {
  title?: string
  artist?: string
  album?: string
  coverUrl?: string
  startedAt?: number
  duration?: number
}

export interface PlayerState {
  currentStation: Station | null
  currentTrack: TrackMetadata | null
  isPlaying: boolean
  volume: number
}
