import type { Station, TrackMetadata } from '../types'
import { proxyUrl } from '../utils/proxyUrl'

const STATION_PAYLOADS: Record<string, string> = {
  fip: 'W3siYnJhbmROYW1lIjoxfSwiZmlwIl0',
  francemusique: 'W3siYnJhbmROYW1lIjoxfSwiZnJhbmNlbXVzaXF1ZSJd',
}

export async function fetchMetadata(station: Station): Promise<TrackMetadata> {
  const payload = STATION_PAYLOADS[station.adapterConfig.stationId]

  if (payload === undefined) {
    throw new Error(`Station Radio France inconnue : ${station.adapterConfig.stationId}`)
  }

  const response = await fetch(
    proxyUrl(`https://www.radiofrance.fr/_app/remote/di23tz/getLive?payload=${payload}`),
  )

  if (!response.ok) {
    throw new Error(`Erreur API Radio France : ${response.status}`)
  }

  const data = await response.json()
  const decoded: unknown[] = JSON.parse(data.result)

  const meta = decoded[0] as { now: number; next: number }
  const now = decoded[meta.now] as {
    startTime: number
    endTime: number
    cover: number
    firstLine: number
    secondLine: number
    song: number
  }

  const startTime = decoded[now.startTime] as number
  const endTime = decoded[now.endTime] as number
  const firstLine = decoded[now.firstLine] as string
  const secondLine = decoded[now.secondLine] as string
  const cover = decoded[now.cover] as { id: number } | null
  const coverId = cover ? (decoded[cover.id] as string) : undefined
  const song = decoded[now.song] as { release: number } | null
  const release = song ? (decoded[song.release] as { title: number } | null) : null
  const albumTitle = release ? (decoded[release.title] as string) : undefined

  return {
    title: firstLine ?? undefined,
    artist: secondLine ?? undefined,
    album: albumTitle ?? undefined,
    coverUrl: coverId ? `https://www.radiofrance.fr/pikapi/images/${coverId}/800x800` : undefined,
    startedAt: startTime ?? undefined,
    duration: startTime && endTime ? endTime - startTime : undefined,
  }
}
