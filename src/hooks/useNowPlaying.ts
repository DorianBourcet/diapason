import { useEffect, useRef } from 'react'
import { usePlayerStore } from '../store/playerStore'
import type { Station, TrackMetadata } from '../types'

const SIXTY_SECONDS_INTERVAL = 60000
const THIRTY_SECONDS_INTERVAL = 30000

async function fetchMetadata(station: Station): Promise<TrackMetadata> {
  const adapter = await import(`../adapters/${station.adapter}.ts`)
  return adapter.fetchMetadata(station)
}

function normalizeTrack(track: TrackMetadata): TrackMetadata {
  return {
    ...track,
    title: track.title || 'Titre inconnu',
    artist: track.artist || 'Artiste inconnu',
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
  const { currentStation, status, setCurrentTrack, getCachedMetadata, setCachedMetadata } =
    usePlayerStore()
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!currentStation || status !== 'playing') {
      setCurrentTrack(null)
      return
    }

    async function poll() {
      try {
        // Check cache first
        const cached = getCachedMetadata?.(currentStation!.id)
        if (cached && cached.startedAt && cached.duration) {
          const now = Date.now() / 1000
          if (cached.startedAt + cached.duration > now) {
            setCurrentTrack(cached)
            const delay = getNextPollDelay(cached)
            timeoutRef.current = setTimeout(poll, delay)
            return
          }
        }

        const track = normalizeTrack(await fetchMetadata(currentStation!))
        setCurrentTrack(track)

        const now = Date.now() / 1000
        if (track.startedAt && track.duration && track.startedAt + track.duration > now) {
          setCachedMetadata?.(currentStation!.id, track)
        }

        const delay = getNextPollDelay(track)
        timeoutRef.current = setTimeout(poll, delay)
      } catch (error) {
        console.error('Error fetching metadata:', error)
        timeoutRef.current = setTimeout(poll, SIXTY_SECONDS_INTERVAL)
      }
    }

    poll()

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [currentStation, status, setCurrentTrack, getCachedMetadata, setCachedMetadata])
}
