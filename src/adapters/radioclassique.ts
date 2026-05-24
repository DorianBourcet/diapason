import type { Station, TrackMetadata } from '../types'
import { proxyUrl } from '../utils/proxyUrl'

const METADATA_URL = 'https://d3gf3bsqck8svl.cloudfront.net/direct-metadata/current.json'

function clean(value: string | undefined): string | undefined {
  if (!value) return undefined
  const html = value.replace(/<br\s*\/?>/gi, ' ')
  const text = new DOMParser().parseFromString(html, 'text/html').body.textContent ?? ''
  const normalised = text.replace(/\s+/g, ' ').trim().replace(/\s*:$/, '').trim()
  return normalised || undefined
}

export async function fetchMetadata(_station: Station): Promise<TrackMetadata> {
  const response = await fetch(proxyUrl(METADATA_URL))

  if (!response.ok) {
    throw new Error(`Radio Classique API error: ${response.status}`)
  }

  const data = (await response.json()) as { auteur?: string; titre?: string }

  return {
    title: clean(data.titre),
    artist: clean(data.auteur),
  }
}
