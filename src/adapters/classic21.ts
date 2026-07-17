import type { Station, TrackMetadata } from '../types'
import { proxyUrl } from '../utils/proxyUrl'

// RTBF's own metadata (real title/artist/album + editorial covers on
// static-content.rtbf.be) lives on the "conducteur" page. Its Radioplayer mirror
// (np/search.maradio.be) is geo-fenced to Belgium and rejected by the proxy, so we
// scrape the page instead. The track list is embedded in the Next.js RSC payload.
const CONDUCTEUR_URL = 'https://www.rtbf.be/classic21/retrouver-un-titre'

interface RtbfImage {
  xs?: string
  s?: string
  m?: string
  l?: string
  xl?: string
}

interface RtbfTrack {
  id: number
  title?: string | null
  performer?: string | null
  album?: string | null
  dateTime?: string | null
  albumCover?: {
    cover?: RtbfImage
    illustration?: RtbfImage
  }
}

// The track JSON is escaped inside JS string literals of `self.__next_f.push([1,"…"])`.
// Concatenate every chunk, then unescape so the embedded JSON becomes parseable.
function extractRscPayload(html: string): string {
  const chunks = [...html.matchAll(/self\.__next_f\.push\(\[1,"((?:\\.|[^"\\])*)"\]\)/g)]
  const joined = chunks.map((m) => m[1]).join('')
  try {
    // The chunks are JS string literals; wrap and JSON.parse to apply the escaping.
    return JSON.parse(`"${joined}"`)
  } catch {
    return joined
  }
}

// Parse every `{"id":<n>,…,"albumCover":{…}}` object by walking balanced braces from
// each `"id":` occurrence — robust to the surrounding RSC noise.
function parseTracks(payload: string): RtbfTrack[] {
  const tracks: RtbfTrack[] = []
  const re = /\{"id":\d+,"title":/g
  let match: RegExpExecArray | null
  while ((match = re.exec(payload)) !== null) {
    const start = match.index
    let depth = 0
    for (let i = start; i < payload.length; i++) {
      const c = payload[i]
      if (c === '{') depth++
      else if (c === '}') {
        depth--
        if (depth === 0) {
          try {
            const obj = JSON.parse(payload.slice(start, i + 1)) as RtbfTrack
            if (obj.albumCover) tracks.push(obj)
          } catch {
            // skip malformed slice
          }
          break
        }
      }
    }
  }
  return tracks
}

function coverUrl(track: RtbfTrack): string | undefined {
  const xl = track.albumCover?.cover?.xl ?? track.albumCover?.illustration?.xl
  if (!xl) return undefined
  return xl.includes('?') ? xl : `${xl}?webp=1`
}

export async function fetchMetadata(_station: Station): Promise<TrackMetadata> {
  const response = await fetch(proxyUrl(CONDUCTEUR_URL))

  if (!response.ok) {
    throw new Error(`RTBF Classic 21 page error: ${response.status}`)
  }

  const html = await response.text()
  const tracks = parseTracks(extractRscPayload(html))

  if (tracks.length === 0) {
    console.warn('classic21 adapter: no track found in RTBF conducteur page')
    return {}
  }

  // Current track = latest dateTime not in the future.
  const now = Date.now()
  const current = tracks
    .map((t) => ({ t, at: t.dateTime ? Date.parse(t.dateTime) : NaN }))
    .filter(({ at }) => Number.isFinite(at) && at <= now)
    .sort((a, b) => b.at - a.at)[0]

  const chosen = current?.t ?? tracks[0]
  const startedAt = chosen.dateTime ? Date.parse(chosen.dateTime) : NaN

  return {
    title: chosen.title || undefined,
    artist: chosen.performer || undefined,
    album: chosen.album || undefined,
    coverUrl: coverUrl(chosen),
    startedAt: Number.isFinite(startedAt) ? Math.floor(startedAt / 1000) : undefined,
  }
}
