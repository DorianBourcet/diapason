import type { Station, TrackMetadata } from '../types'
import { proxyUrl } from '../utils/proxyUrl'

interface LiveMetaEntry {
  // fip_extended
  title?: string
  interpreters?: string
  album?: string
  // transistor_*_player
  firstLine?: string
  secondLine?: string
  // common
  cover?: string | null
  startTime?: number | null
  endTime?: number | null
}

interface LiveMetaResponse {
  now?: LiveMetaEntry
  delayToRefresh?: number
}

const coverUrlFor = (id?: string | null) =>
  id ? `https://www.radiofrance.fr/pikapi/images/${id}/800x800` : undefined

function splitArtistTitle(line?: string): { artist?: string; title?: string } {
  if (!line) return {}
  const idx = line.indexOf(' • ')
  if (idx === -1) return { title: line }
  return {
    artist: line.slice(0, idx).trim() || undefined,
    title: line.slice(idx + 3).trim() || undefined,
  }
}

type CoreMeta = Pick<TrackMetadata, 'title' | 'artist' | 'album'>

function parseNow(visual: string, now: LiveMetaEntry): CoreMeta {
  if (visual === 'fip_extended') {
    return {
      title: now.title,
      artist: now.interpreters || undefined,
      album: now.album || undefined,
    }
  }
  if (visual === 'transistor_musical_player') {
    return splitArtistTitle(now.secondLine)
  }
  return { title: now.secondLine, artist: now.firstLine }
}

export async function fetchMetadata(station: Station): Promise<TrackMetadata> {
  const liveId = station.adapterConfig?.liveId
  if (!liveId) {
    throw new Error(`Missing adapterConfig.liveId for station: ${station.id}`)
  }
  const visual = station.adapterConfig?.visual ?? 'fip_extended'

  const response = await fetch(
    proxyUrl(`https://api.radiofrance.fr/livemeta/live/${liveId}/${visual}`),
  )
  if (!response.ok) {
    throw new Error(`Radio France API error: ${response.status}`)
  }

  const data: LiveMetaResponse = await response.json()
  const now = data.now ?? {}
  const startTime = now.startTime ? now.startTime + 35 : undefined
  const endTime = now.endTime ? now.endTime + 35 : undefined

  return {
    ...parseNow(visual, now),
    coverUrl: coverUrlFor(now.cover),
    startedAt: startTime,
    duration: startTime != null && endTime != null ? endTime - startTime : undefined,
    refreshIn: data.delayToRefresh,
  }
}
