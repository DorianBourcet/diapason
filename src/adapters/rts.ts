import type { Station, TrackMetadata } from '../types'
import { proxyUrl } from '../utils/proxyUrl'

const LIVE_PAGE = (channel: string) => `https://www.rts.ch/audio-podcast/livepopup/${channel}/`

export async function fetchMetadata(station: Station): Promise<TrackMetadata> {
  const channel = station.adapterConfig?.channel
  if (!channel) {
    throw new Error(`Missing adapterConfig.channel for station: ${station.id}`)
  }

  const response = await fetch(proxyUrl(LIVE_PAGE(channel)))

  if (!response.ok) {
    throw new Error(`RTS API error: ${response.status}`)
  }

  const html = await response.text()
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const song = doc.querySelector('.song-list .song-items .song-item')

  if (!song) return {}

  return {
    title: song.querySelector('.title')?.textContent?.trim() || undefined,
    artist: song.querySelector('.artist')?.textContent?.trim() || undefined,
  }
}
