import type { Station, TrackMetadata } from '../types'
import { proxyUrl } from '../utils/proxyUrl'

const ALL_RADIOS_URL = 'https://www.nova.fr/radios-data/www.nova.fr/all.json'

interface NovaEntry {
  radio?: { code?: string }
  currentTrack?: {
    title?: string
    artist?: string
    image?: string
    duration?: string
    diffusion_date?: string
  }
  currentShow?: {
    title?: string
    author?: string
    cover?: string
  }
}

// Durations come as "MM:SS" (or "HH:MM:SS"); fold the parts into seconds.
function parseDuration(value: string | undefined): number | undefined {
  if (!value) return undefined
  const parts = value.split(':').map(Number)
  if (parts.some((n) => Number.isNaN(n))) return undefined
  return parts.reduce((total, n) => total * 60 + n)
}

// How far ahead of UTC Europe/Paris is (ms) at a given instant.
function parisOffsetMs(utcMs: number): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Paris',
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(new Date(utcMs))
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value)
  const asIfUtc = Date.UTC(
    get('year'),
    get('month') - 1,
    get('day'),
    get('hour'),
    get('minute'),
    get('second'),
  )
  return asIfUtc - utcMs
}

// Start time is a wall-clock "YYYY-MM-DD HH:mm:ss" string in Europe/Paris with no
// timezone specified. Interpret it as Paris time and return epoch seconds (UTC), so
// the elapsed position is correct regardless of the listener's own timezone.
function parseStart(value: string | undefined): number | undefined {
  const m = value?.match(/(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/)
  if (!m) return undefined
  const [, y, mo, d, h, mi, s] = m.map(Number)
  const asUtc = Date.UTC(y, mo - 1, d, h, mi, s)
  return Math.floor((asUtc - parisOffsetMs(asUtc)) / 1000)
}

export async function fetchMetadata(station: Station): Promise<TrackMetadata> {
  const code = station.adapterConfig?.code
  if (!code) {
    throw new Error(`Missing adapterConfig.code for station: ${station.id}`)
  }

  const response = await fetch(proxyUrl(ALL_RADIOS_URL))

  if (!response.ok) {
    throw new Error(`Nova API error: ${response.status}`)
  }

  const data = (await response.json()) as NovaEntry[]
  const entry = data.find((entry) => entry.radio?.code === code)

  const track = entry?.currentTrack
  if (track && (track.title || track.artist)) {
    return {
      title: track.title || undefined,
      artist: track.artist || undefined,
      coverUrl: track.image || undefined,
      duration: parseDuration(track.duration),
      startedAt: parseStart(track.diffusion_date),
    }
  }

  // No music playing (e.g. a talk show): fall back to the current show.
  const show = entry?.currentShow
  if (show && (show.title || show.author)) {
    return {
      title: show.title || undefined,
      artist: show.author || undefined,
      coverUrl: show.cover || undefined,
    }
  }

  return {}
}
