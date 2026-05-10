import { useEffect } from 'react'
import { usePlayerStore } from '../store/playerStore'
import { metadataCache } from '../utils/metadataCache'
import { adapters } from '../adapters'
import type { Station, TrackMetadata } from '../types'

const SIXTY_SECONDS_INTERVAL = 60000
const THIRTY_SECONDS_INTERVAL = 30000
const ERROR_BACKOFF_CAP = 5 * 60 * 1000
const ERROR_TOAST_THRESHOLD = 3

async function fetchMetadata(station: Station): Promise<TrackMetadata | null> {
  if (!station.adapter) return null
  return adapters[station.adapter].fetchMetadata(station)
}

function normalizeTrack(track: TrackMetadata | null): TrackMetadata {
  return {
    ...track,
    title: track?.title || undefined,
    artist: track?.artist || undefined,
  }
}

function getNextPollDelay(track: TrackMetadata): number {
  if (!track.startedAt || !track.duration) return SIXTY_SECONDS_INTERVAL

  const now = Date.now() / 1000
  const endsAt = track.startedAt + track.duration + 5
  const delay = (endsAt - now) * 1000
  if (delay <= 0) return THIRTY_SECONDS_INTERVAL

  return Math.max(delay, THIRTY_SECONDS_INTERVAL)
}

export function useNowPlaying() {
  const currentStation = usePlayerStore((s) => s.currentStation)
  const status = usePlayerStore((s) => s.status)
  const setCurrentTrack = usePlayerStore((s) => s.setCurrentTrack)

  const setErrorMessage = usePlayerStore((s) => s.setErrorMessage)
  const stationId = currentStation?.id
  const shouldPoll = status === 'playing' || status === 'loading'

  useEffect(() => {
    if (!shouldPoll || !currentStation) {
      setCurrentTrack(null)
      return
    }

    const station = currentStation
    let cancelled = false
    let timeoutId: ReturnType<typeof setTimeout> | null = null
    let consecutiveFailures = 0

    const schedule = (delay: number) => {
      if (cancelled) return
      timeoutId = setTimeout(tick, delay)
    }

    const tick = async () => {
      try {
        const cached = metadataCache.get(station.id)
        if (cached) {
          if (cancelled) return
          setCurrentTrack(cached)
          schedule(getNextPollDelay(cached))
          return
        }

        const raw = await fetchMetadata(station)
        if (cancelled) return

        const track = normalizeTrack(raw)

        if (track.coverUrl) {
          const img = new Image()
          img.src = track.coverUrl
        }
        setCurrentTrack(track)
        metadataCache.set(station.id, track)
        consecutiveFailures = 0

        schedule(getNextPollDelay(track))
      } catch (error) {
        if (cancelled) return
        consecutiveFailures += 1
        console.error(`Error fetching metadata (attempt ${consecutiveFailures}):`, error)
        if (consecutiveFailures === ERROR_TOAST_THRESHOLD) {
          setErrorMessage('Métadonnées indisponibles')
        }
        const delay = Math.min(
          SIXTY_SECONDS_INTERVAL * 2 ** (consecutiveFailures - 1),
          ERROR_BACKOFF_CAP,
        )
        schedule(delay)
      }
    }

    tick()

    return () => {
      cancelled = true
      if (timeoutId) clearTimeout(timeoutId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldPoll, stationId, setCurrentTrack, setErrorMessage])
}
