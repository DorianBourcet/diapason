import type { Station, TrackMetadata } from '../types'
import { proxyUrl } from '../utils/proxyUrl'

const eventsUrl = (prefix: string, rpId: string) =>
  `https://core-search.radioplayer.cloud/${prefix}/qp/v4/events/?rpId=${rpId}`

interface RadioplayerEvent {
  name?: string
  artistName?: string
  imageUrl?: string
  startTime?: string
  stopTime?: string
}

export async function fetchMetadata(station: Station): Promise<TrackMetadata> {
  const { prefix, rpId } = station.adapterConfig ?? {}
  if (!prefix || !rpId) {
    throw new Error(`Missing adapterConfig.prefix/rpId for station: ${station.id}`)
  }

  const response = await fetch(proxyUrl(eventsUrl(prefix, rpId)))

  if (!response.ok) {
    throw new Error(`Radioplayer API error: ${response.status}`)
  }

  const data = (await response.json()) as { results?: { now?: RadioplayerEvent } }
  const now = data.results?.now

  if (!now || (!now.name && !now.artistName)) return {}

  const start = Number(now.startTime)
  const stop = Number(now.stopTime)

  return {
    title: now.name || undefined,
    artist: now.artistName || undefined,
    coverUrl: now.imageUrl || undefined,
    startedAt: Number.isFinite(start) ? start : undefined,
    duration: Number.isFinite(start) && Number.isFinite(stop) ? stop - start : undefined,
  }
}
