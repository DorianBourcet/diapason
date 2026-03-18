import type { Station, TrackMetadata } from '../types'

const STATION_SLUGS: Record<string, string> = {
  fip: 'fip',
  francemusique: 'francemusique',
  franceinter: 'franceinter',
  franceculture: 'franceculture',
}

export async function fetchMetadata(station: Station): Promise<TrackMetadata> {
  const slug = STATION_SLUGS[station.adapterConfig.stationId]

  if (!slug) {
    throw new Error(`Station Radio France inconnue : ${station.adapterConfig.stationId}`)
  }

  const response = await fetch(`/proxy/www.radiofrance.fr/${slug}/api/live`)

  if (!response.ok) {
    throw new Error(`Erreur API Radio France : ${response.status}`)
  }

  const data = await response.json()
  const now = data.now

  if (!now) {
    throw new Error('Aucun titre en cours')
  }

  const duration = now.startTime && now.endTime ? now.endTime - now.startTime : undefined

  return {
    title: now.firstLine?.title ?? undefined,
    artist: now.secondLine?.title ?? undefined,
    album: now.song?.release?.title ?? undefined,
    coverUrl: now.visuals?.card?.src ? now.visuals?.card?.src + '/800x800' : undefined,
    startedAt: now.startTime ?? undefined,
    duration,
  }
}
