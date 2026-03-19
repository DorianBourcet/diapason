import type { Station, TrackMetadata } from '../types'
import { proxyUrl } from '../utils/proxyUrl'

export async function fetchMetadata(_station: Station): Promise<TrackMetadata> {
  const response = await fetch(proxyUrl('https://www.grrif.ch/live/covers.json'))

  if (!response.ok) {
    throw new Error(`Erreur API GRRIF : ${response.status}`)
  }

  const data = await response.json()

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Aucun titre en cours')
  }

  const current = data[data.length - 1]

  return {
    title: current.Title ? current.Title : undefined,
    artist: current.Artist ? current.Artist : undefined,
    coverUrl: current.URLCover ?? undefined,
  }
}
