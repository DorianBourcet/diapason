import type { Station, TrackMetadata } from '../types'
import { proxyUrl } from '../utils/proxyUrl'

export async function fetchMetadata(_station: Station): Promise<TrackMetadata> {
  const response = await fetch(proxyUrl('https://tracklist-api.kcrw.com/Music'))

  if (!response.ok) {
    throw new Error(`KCRW API error: ${response.status}`)
  }

  const data = (await response.json()) as KcrwApiResponse

  return {
    title: data.title ?? undefined,
    artist: data.artist ?? undefined,
    album: data.album ?? undefined,
    coverUrl: data.albumImageLarge ?? data.albumImage ?? undefined,
  }
}

interface KcrwApiResponse {
  title: string | null
  artist: string | null
  album: string | null
  albumImage: string | null
  albumImageLarge: string | null
  program_title: string | null
  program_start: string | null
  program_end: string | null
  datetime: string | null
  artist_url: string | null
  label: string | null
  year: number | null
  play_id: number
}
