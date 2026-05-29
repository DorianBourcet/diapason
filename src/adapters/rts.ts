import type { Station, TrackMetadata } from '../types'
import { proxyUrl } from '../utils/proxyUrl'

const LIVE_PAGE = (channel: string) => `https://www.rts.ch/audio-podcast/livepopup/${channel}/`

// How far ahead of UTC Europe/Zurich is (ms) at a given instant.
function zurichOffsetMs(utcMs: number): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Zurich',
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

// The "bait" is the current show's slot, e.g. "21:00 - 22:00", as wall-clock
// Zurich time with no date. Interpret its start (HH:mm) on today's Zurich date
// and return the corresponding epoch (ms), so the comparison holds regardless
// of the listener's own timezone.
function parseShowStart(bait: string | null | undefined): number | undefined {
  const m = bait?.match(/(\d{1,2}):(\d{2})/)
  if (!m) return undefined
  const [, h, mi] = m.map(Number)
  const today = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Zurich',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())
  const get = (type: string) => Number(today.find((p) => p.type === type)?.value)
  const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), h, mi, 0)
  return asUtc - zurichOffsetMs(asUtc)
}

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
  const live = doc.querySelector('#livePopupNowPlaying')

  // The latest logged track is the live one only while a song is playing within
  // the current show. When a (talk) show is on air, the song list goes stale, so
  // the show — described by #livePopupNowPlaying — supplants the last track.
  const songEpoch = song?.getAttribute('data-song-dt')
    ? new Date(song.getAttribute('data-song-dt') as string).getTime()
    : NaN
  const showStart = parseShowStart(live?.querySelector('time.bait')?.textContent)
  const showSupplants =
    Number.isNaN(songEpoch) || (showStart !== undefined && songEpoch < showStart)

  if (!showSupplants && song) {
    return {
      title: song.querySelector('.title')?.textContent?.trim() || undefined,
      artist: song.querySelector('.artist')?.textContent?.trim() || undefined,
    }
  }

  if (live) {
    return {
      title: live.querySelector('.media-title')?.textContent?.trim() || undefined,
      coverUrl: live.querySelector('.thumbnail img')?.getAttribute('src') || undefined,
    }
  }

  return {}
}
