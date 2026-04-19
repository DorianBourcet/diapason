import { useEffect, useRef } from 'react'
import { usePlayerStore } from '../store/playerStore'

export function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const { currentStation, currentTrack, status, setStatus, setErrorMessage, volume, muted } =
    usePlayerStore()
  const currentStreamUrl = currentStation?.streamUrl

  // Sync audio element events → store status
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onPlaying = () => setStatus('playing')
    const onWaiting = () => setStatus('loading')
    const onStalled = () => {
      setStatus('stopped')
      setErrorMessage('Connexion au flux audio perdue')
    }
    const onError = () => {
      setStatus('stopped')
      setErrorMessage('Impossible de se connecter au flux audio')
    }

    audio.addEventListener('playing', onPlaying)
    audio.addEventListener('waiting', onWaiting)
    audio.addEventListener('stalled', onStalled)
    audio.addEventListener('error', onError)

    return () => {
      audio.removeEventListener('playing', onPlaying)
      audio.removeEventListener('waiting', onWaiting)
      audio.removeEventListener('stalled', onStalled)
      audio.removeEventListener('error', onError)
      // Don't keep the connection alive
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
    }
  }, [setStatus, setErrorMessage])

  // Set audio source when current station changes
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentStreamUrl) return

    let active = true

    if (status === 'loading') {
      if (audio.src !== currentStreamUrl || audio.paused) {
        audio.src = currentStreamUrl
        audio.load()
      }
      audio.play().catch((err) => {
        if (!active) return
        setStatus('stopped')
        // AbortError is expected (src changed mid-play); NotAllowedError is autoplay policy
        if (err.name !== 'AbortError' && err.name !== 'NotAllowedError') {
          setErrorMessage('Impossible de se connecter au flux audio')
        }
      })
    } else if (status === 'paused') {
      audio.pause()
    } else if (status === 'stopped') {
      audio.pause()
    }

    return () => {
      active = false
    }
  }, [currentStreamUrl, setErrorMessage, setStatus, status])

  // Integrate with Media Session API
  useEffect(() => {
    if (!('mediaSession' in navigator)) return

    navigator.mediaSession.setActionHandler('play', () => setStatus('loading'))
    navigator.mediaSession.setActionHandler('pause', () => setStatus('paused'))
    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack?.title,
      artist: currentTrack?.artist,
      album: currentStation?.name,
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

  // Handle volume and mute
  useEffect(() => {
    if (!audioRef.current) return
    audioRef.current.volume = muted ? 0 : volume / 100
  }, [volume, muted])

  return <audio ref={audioRef} />
}
