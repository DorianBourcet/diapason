import type { Station, TrackMetadata } from '../types'
import { proxyUrl } from '../utils/proxyUrl'

const diffusionsUrl = (radioStreamId: string) =>
  `https://www.ouifm.fr/api/TitleDiffusions?size=1&radioStreamId=${radioStreamId}&date=${Date.now()}`

interface TitleDiffusion {
  timestamp?: string
  title?: {
    artist?: string
    title?: string
    coverUrl?: string
  }
}

export async function fetchMetadata(station: Station): Promise<TrackMetadata> {
  const radioStreamId = station.adapterConfig?.radioStreamId
  if (!radioStreamId) {
    throw new Error(`Missing adapterConfig.radioStreamId for station: ${station.id}`)
  }

  const response = await fetch(proxyUrl(diffusionsUrl(radioStreamId)))

  if (!response.ok) {
    throw new Error(`OUI FM API error: ${response.status}`)
  }

  const data = (await response.json()) as TitleDiffusion[]
  const current = data[0]?.title

  if (!current || (!current.title && !current.artist)) return {}

  const started = data[0]?.timestamp ? Date.parse(data[0].timestamp) : NaN

  return {
    title: current.title || undefined,
    artist: current.artist || undefined,
    coverUrl: current.coverUrl || undefined,
    startedAt: Number.isFinite(started) ? Math.floor(started / 1000) : undefined,
  }
}
