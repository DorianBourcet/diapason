import type { Station, TrackMetadata } from '../types'
import { proxyUrl } from '../utils/proxyUrl'

const ONAIR_URL = 'https://www.jazzradio.fr/lite/update_onair'

interface OnAirEntry {
  artist?: string
  title?: string
  cover?: string
}

export async function fetchMetadata(station: Station): Promise<TrackMetadata> {
  const radioId = station.adapterConfig?.radioId
  if (!radioId) {
    throw new Error(`Missing adapterConfig.radioId for station: ${station.id}`)
  }

  const response = await fetch(proxyUrl(ONAIR_URL), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ radio_ids: [radioId] }),
  })

  if (!response.ok) {
    throw new Error(`Jazz Radio API error: ${response.status}`)
  }

  const data = (await response.json()) as Record<string, OnAirEntry>
  const entry = data[radioId]

  if (!entry || (!entry.title && !entry.artist)) return {}

  return {
    title: entry.title || undefined,
    artist: entry.artist || undefined,
    coverUrl: entry.cover || undefined,
  }
}
