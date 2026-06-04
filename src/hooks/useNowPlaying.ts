import { useEffect } from 'react'
import { usePlayerStore } from '../store/playerStore'
import { metadataCache } from '../utils/metadataCache'
import { adapters } from '../adapters'
import type { Station, TrackMetadata } from '../types'

const SIXTY_SECONDS_INTERVAL = 60000
const THIRTY_SECONDS_INTERVAL = 30000
const ERROR_BACKOFF_CAP = 5 * 60 * 1000
const ERROR_TOAST_THRESHOLD = 3
const REFRESH_IN_MIN_INTERVAL = 10000
const REFRESH_IN_MAX_INTERVAL = 120000

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
  const endDelay =
    track.startedAt && track.duration
      ? (track.startedAt + track.duration + 1 - Date.now() / 1000) * 1000
      : null

  if (track.refreshIn != null) {
    const target =
      endDelay != null && endDelay > 0 ? Math.min(track.refreshIn, endDelay) : track.refreshIn
    return Math.min(Math.max(target, REFRESH_IN_MIN_INTERVAL), REFRESH_IN_MAX_INTERVAL)
  }

  if (endDelay != null) {
    if (endDelay <= 0) return THIRTY_SECONDS_INTERVAL
    return endDelay
  }

  return SIXTY_SECONDS_INTERVAL
}

export function useNowPlaying() {
  const currentStation = usePlayerStore((s) => s.currentStation)
  const status = usePlayerStore((s) => s.status)
  const setCurrentTrack = usePlayerStore((s) => s.setCurrentTrack)
  const setMetadataStatus = usePlayerStore((s) => s.setMetadataStatus)

  const setErrorMessage = usePlayerStore((s) => s.setErrorMessage)
  const stationId = currentStation?.id
  const shouldPoll = status === 'playing' || status === 'loading'

  useEffect(() => {
    if (!shouldPoll || !currentStation) {
      setCurrentTrack(null)
      return
    }

    const station = currentStation

    if (!station.adapter) {
      setCurrentTrack(null)
      setMetadataStatus('unavailable')
      return
    }

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
          setMetadataStatus('ready')
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
        setMetadataStatus('ready')
        metadataCache.set(station.id, track)
        consecutiveFailures = 0

        schedule(getNextPollDelay(track))
      } catch (error) {
        if (cancelled) return
        setMetadataStatus('unavailable')
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

    const revalidate = () => {
      if (cancelled || document.visibilityState !== 'visible') return
      if (timeoutId) clearTimeout(timeoutId)
      tick()
    }
    document.addEventListener('visibilitychange', revalidate)
    window.addEventListener('online', revalidate)

    return () => {
      cancelled = true
      if (timeoutId) clearTimeout(timeoutId)
      document.removeEventListener('visibilitychange', revalidate)
      window.removeEventListener('online', revalidate)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldPoll, stationId, setCurrentTrack, setMetadataStatus, setErrorMessage])
}
