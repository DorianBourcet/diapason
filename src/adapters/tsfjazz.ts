import type { Station, TrackMetadata } from '../types'

export async function fetchMetadata(_station: Station): Promise<TrackMetadata> {
  const response = await fetch('/proxy/www.tsfjazz.com/player/qect', {
    method: 'POST',
  })

  if (!response.ok) {
    throw new Error(`Erreur API TSF Jazz : ${response.status}`)
  }

  const data = await response.json()
  const current = data.current

  if (!current) {
    throw new Error('Aucun titre en cours')
  }

  return {
    title: current.title ? current.title.toLowerCase() : undefined,
    artist: current.artist ? current.artist : undefined,
    coverUrl: current.cover ?? undefined,
    startedAt: current.start_time ?? undefined,
    duration: current.duration ?? undefined,
  }
}
