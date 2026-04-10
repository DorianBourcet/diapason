import type { Station, TrackMetadata } from '../types'
import { proxyUrl } from '../utils/proxyUrl'

export async function fetchMetadata(station: Station): Promise<TrackMetadata> {
  if (!station.adapterConfig) {
    throw new Error(`Missing adapterConfig for station: ${station.id}`)
  }

  const response = await fetch(
    proxyUrl(
      `https://ec3.yesstreaming.net:2910/api/v2/history/?limit=1&offset=0&server=${station.adapterConfig.serverId}`,
    ),
  )

  if (!response.ok) {
    throw new Error(`YesStreaming API error: ${response.status}`)
  }

  const data = (await response.json()) as YesStreamingApiResponse
  const play = data.results[0] ?? null

  if (!play) {
    return {}
  }

  return {
    title: play.title || undefined,
    artist: play.author || undefined,
    album: play.album || undefined,
    coverUrl: play.img_large_url ?? play.img_medium_url ?? play.img_url ?? undefined,
    startedAt: play.ts ? play.ts / 1000 : undefined,
    duration: play.length ? play.length / 1000 : undefined,
  }
}

interface YesStreamingPlay {
  id: number
  title: string
  author: string | null
  author_other: string | null
  album: string | null
  img_url: string | null
  img_medium_url: string | null
  img_large_url: string | null
  ts: number
  length: number
  dj_name: string | null
  playlist_title: string | null
}

interface YesStreamingApiResponse {
  results: YesStreamingPlay[]
}
