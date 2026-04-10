import type { Station, TrackMetadata } from '../types'
import { proxyUrl } from '../utils/proxyUrl'

const KEXP_API_URL = 'https://api.kexp.org/v2/plays/?format=json'

export async function fetchMetadata(_station: Station): Promise<TrackMetadata> {
  const response = await fetch(proxyUrl(KEXP_API_URL))

  if (!response.ok) {
    throw new Error(`KEXP API error: ${response.status}`)
  }

  const data = (await response.json()) as KexpApiResponse

  const play = data.results.find((p) => p.play_type === 'trackplay') ?? null

  if (!play) {
    return {}
  }

  const startedAt = play.airdate ? new Date(play.airdate).getTime() / 1000 : undefined

  return {
    title: play.song ?? undefined,
    artist: play.artist ?? undefined,
    album: play.album ?? undefined,
    coverUrl: play.image_uri || undefined,
    startedAt,
  }
}

interface KexpPlay {
  id: number
  play_type: 'trackplay' | 'airbreak' | string
  airdate: string | null
  song: string | null
  artist: string | null
  album: string | null
  image_uri: string
  thumbnail_uri: string
}

interface KexpApiResponse {
  results: KexpPlay[]
}
