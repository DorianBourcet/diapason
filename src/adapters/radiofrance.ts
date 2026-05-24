import type { Station, TrackMetadata } from '../types'
import { proxyUrl } from '../utils/proxyUrl'

// Maps each station's `adapterConfig.stationId` to the slug expected by the
// Radio France getLive API.
const STATION_SLUGS: Record<string, string> = {
  fip: 'fip',
  fipRock: 'fip_rock',
  fipJazz: 'fip_jazz',
  fipGroove: 'fip_groove',
  fipPop: 'fip_pop',
  fipElectro: 'fip_electro',
  fipReggae: 'fip_reggae',
  fipWorld: 'fip_world',
  fipNouveautes: 'fip_nouveautes',
  fipHiphop: 'fip_hiphop',
  fipMetal: 'fip_metal',
  fipSacreFrancais: 'fip_sacre_francais',
  fipCultes: 'fip_cultes',
  francemusique: 'francemusique',
  francemusiqueClassiqueEasy: 'francemusique_classique_easy',
  francemusiqueClassiqueLove: 'francemusique_classique_love',
  francemusiquePianoZen: 'francemusique_piano_zen',
  francemusiqueBaroque: 'francemusique_baroque',
  francemusiqueFilms: 'francemusique_evenementielle',
  francemusiqueClassiquePlus: 'francemusique_classique_plus',
  francemusiqueOpera: 'francemusique_opera',
  francemusiqueConcertsRf: 'francemusique_concert_rf',
  francemusiqueLaJazz: 'francemusique_la_jazz',
  francemusiqueLaContemporaine: 'francemusique_la_contemporaine',
  francemusiqueOcora: 'francemusique_ocora_monde',
}

// The getLive endpoint expects a base64url-encoded payload of the shape
// [{ brandName, version }, slug, "YYYY-MM-DD"]. Any recent date is accepted.
function buildPayload(slug: string): string {
  const date = new Date().toISOString().slice(0, 10)
  return btoa(JSON.stringify([{ brandName: 1, version: 2 }, slug, date])).replace(/=+$/, '')
}

export async function fetchMetadata(station: Station): Promise<TrackMetadata> {
  if (!station.adapterConfig) {
    throw new Error(`Missing adapterConfig for station: ${station.id}`)
  }
  const slug = STATION_SLUGS[station.adapterConfig.stationId]

  if (slug === undefined) {
    throw new Error(`Unknown Radio France station: ${station.adapterConfig.stationId}`)
  }

  const payload = buildPayload(slug)

  const response = await fetch(
    proxyUrl(`https://www.radiofrance.fr/_app/remote/di23tz/getLive?payload=${payload}`),
  )

  if (!response.ok) {
    throw new Error(`Radio France API error: ${response.status}`)
  }

  const data = await response.json()
  const decoded: unknown[] = JSON.parse(data.result)

  const meta = decoded[0] as { now: number; next: number }
  const now = decoded[meta.now] as {
    startTime: number
    endTime: number
    cover: number
    firstLine: number
    secondLine: number
    song: number
  }

  const startTime = decoded[now.startTime] as number
  const endTime = decoded[now.endTime] as number
  const firstLine = decoded[now.firstLine] as string
  const secondLine = decoded[now.secondLine] as string
  const cover = decoded[now.cover] as { id: number } | null
  const coverId = cover ? (decoded[cover.id] as string) : undefined
  const song = decoded[now.song] as { release: number } | null
  const release = song ? (decoded[song.release] as { title: number } | null) : null
  const albumTitle = release ? (decoded[release.title] as string) : undefined

  return {
    title: firstLine ?? undefined,
    artist: secondLine ?? undefined,
    album: albumTitle ?? undefined,
    coverUrl: coverId ? `https://www.radiofrance.fr/pikapi/images/${coverId}/800x800` : undefined,
    startedAt: startTime ?? undefined,
    duration: startTime && endTime ? endTime - startTime : undefined,
  }
}
