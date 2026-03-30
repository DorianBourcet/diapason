import { useEffect, useRef } from 'react'
import { usePlayerStore } from '../store/playerStore'

export function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const { currentStation, currentTrack, status, setStatus, volume } = usePlayerStore()

  // Set audio source when current station changes
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentStation) return

    let active = true

    audio.src = currentStation.streamUrl
    audio.load()

    if (status === 'playing') {
      audio.play().catch(() => {
        if (active) setStatus('stopped')
      })
    }

    return () => {
      active = false
      audio.pause()
      audio.src = ''
    }
  }, [currentStation, setStatus, status])

  // Controls play/pause based on status (station changes excluded)
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    let active = true

    if (status === 'playing') {
      audio.play().catch(() => {
        if (active) setStatus('stopped')
      })
    } else if (status === 'paused') {
      audio.pause()
    }

    return () => {
      active = false
    }
  }, [status, setStatus])

  // Integrate with Media Session API
  useEffect(() => {
    if (!('mediaSession' in navigator)) return

    navigator.mediaSession.setActionHandler('play', () => setStatus('playing'))
    navigator.mediaSession.setActionHandler('pause', () => setStatus('paused'))
    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack?.title || currentStation?.name,
      artist: currentTrack?.artist,
      album: currentTrack?.album,
      ...(currentTrack?.coverUrl && {
        artwork: [{ src: currentTrack.coverUrl }],
      }),
    })
    if (currentTrack?.startedAt && currentTrack?.duration) {
      const elapsed = Date.now() / 1000 - currentTrack.startedAt
      navigator.mediaSession.setPositionState({
        duration: currentTrack.duration,
        position: Math.min(elapsed, currentTrack.duration),
        playbackRate: 1,
      })
    }

    return () => {
      navigator.mediaSession.setActionHandler('play', null)
      navigator.mediaSession.setActionHandler('pause', null)
      navigator.mediaSession.metadata = null
      navigator.mediaSession.playbackState = 'none'
      navigator.mediaSession.setPositionState(undefined)
    }
  }, [setStatus, currentTrack, currentStation])

  // Handle volume change
  useEffect(() => {
    if (!audioRef.current) return
    audioRef.current.volume = volume / 100
  }, [volume])

  return <audio ref={audioRef} />
}
