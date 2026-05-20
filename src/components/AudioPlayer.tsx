import type Hls from 'hls.js'
import { useEffect, useRef } from 'react'
import { usePlayerStore } from '../store/playerStore'

export function AudioPlayer() {
  // Always use <video> (hidden): hls.js + Managed Media Source on iOS Safari requires
  // a video element, and <video> plays MP3/icecast streams just as well.
  const mediaRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  const prevStreamUrlRef = useRef<string | undefined>(undefined)
  const currentStation = usePlayerStore((s) => s.currentStation)
  const currentTrack = usePlayerStore((s) => s.currentTrack)
  const status = usePlayerStore((s) => s.status)
  const volume = usePlayerStore((s) => s.volume)
  const muted = usePlayerStore((s) => s.muted)
  const play = usePlayerStore((s) => s.play)
  const stop = usePlayerStore((s) => s.stop)
  const reportPlaying = usePlayerStore((s) => s.reportPlaying)
  const reportLoading = usePlayerStore((s) => s.reportLoading)
  const reportError = usePlayerStore((s) => s.reportError)
  const currentStreamUrl = currentStation?.streamUrl

  // Sync media element events → store status
  useEffect(() => {
    const media = mediaRef.current
    if (!media) return

    let stalledTimer: ReturnType<typeof setTimeout> | null = null

    const onPlaying = () => {
      if (stalledTimer) {
        clearTimeout(stalledTimer)
        stalledTimer = null
      }
      reportPlaying()
    }
    const onWaiting = () => reportLoading()
    const onStalled = () => {
      // Safari fires `stalled` spuriously between HLS segment bursts. Only treat it
      // as fatal if `currentTime` has not advanced during the grace window.
      if (media.paused || stalledTimer) return
      const startTime = media.currentTime
      stalledTimer = setTimeout(() => {
        stalledTimer = null
        if (!media.paused && media.currentTime === startTime) {
          reportError('Connexion au flux audio perdue')
        }
      }, 8000)
    }
    const onError = () => reportError('Impossible de se connecter au flux audio')

    media.addEventListener('playing', onPlaying)
    media.addEventListener('waiting', onWaiting)
    media.addEventListener('stalled', onStalled)
    media.addEventListener('error', onError)

    return () => {
      media.removeEventListener('playing', onPlaying)
      media.removeEventListener('waiting', onWaiting)
      media.removeEventListener('stalled', onStalled)
      media.removeEventListener('error', onError)
      if (stalledTimer) clearTimeout(stalledTimer)
      media.pause()
      media.removeAttribute('src')
      media.load()
    }
  }, [reportPlaying, reportLoading, reportError])

  // Set media source when current station changes
  useEffect(() => {
    const media = mediaRef.current
    if (!media || !currentStreamUrl) return

    let active = true

    const startPlayback = async () => {
      // Match `.m3u8` in the path, ignoring query strings (e.g. `?id=radiofrance`).
      const isHls = /\.m3u8($|\?)/i.test(currentStreamUrl)

      hlsRef.current?.destroy()
      hlsRef.current = null

      if (isHls) {
        const { default: HlsJs } = await import('hls.js')
        if (!active) return
        if (HlsJs.isSupported()) {
          const hls = new HlsJs({ lowLatencyMode: true })
          hlsRef.current = hls
          hls.on(HlsJs.Events.ERROR, (_event, data) => {
            if (!active || !data.fatal) return
            reportError('Impossible de se connecter au flux audio')
          })
          hls.loadSource(currentStreamUrl)
          hls.attachMedia(media)
        } else {
          reportError('Impossible de se connecter au flux audio')
          return
        }
      } else {
        if (media.src !== currentStreamUrl || media.paused) {
          media.src = currentStreamUrl
          media.load()
        }
      }

      media.play().catch((err) => {
        if (!active) return
        // AbortError is expected (src changed mid-play); NotAllowedError is autoplay policy
        if (err.name === 'AbortError' || err.name === 'NotAllowedError') return
        reportError('Impossible de se connecter au flux audio')
      })
    }

    if (status === 'loading') {
      const urlChanged = currentStreamUrl !== prevStreamUrlRef.current
      prevStreamUrlRef.current = currentStreamUrl
      // Restart when URL changed (station switch) or when media is paused.
      // Skip reload when `waiting` fires during normal HLS segment transitions.
      if (urlChanged || media.paused) startPlayback()
    } else if (status === 'stopped') {
      media.pause()
      hlsRef.current?.destroy()
      hlsRef.current = null
    }

    return () => {
      active = false
    }
  }, [currentStreamUrl, reportError, status])

  // Safety net: if we stay in 'loading' too long without a 'playing' event,
  // assume the stream is dead and surface an error.
  useEffect(() => {
    if (status !== 'loading') return
    const timer = setTimeout(() => {
      reportError('Connexion au flux audio trop lente')
    }, 15000)
    return () => clearTimeout(timer)
  }, [status, reportError])

  // Media Session: bind action handlers once
  useEffect(() => {
    if (!('mediaSession' in navigator)) return
    navigator.mediaSession.setActionHandler('play', () => play())
    navigator.mediaSession.setActionHandler('pause', () => stop())
    return () => {
      navigator.mediaSession.setActionHandler('play', null)
      navigator.mediaSession.setActionHandler('pause', null)
      navigator.mediaSession.playbackState = 'none'
    }
  }, [play, stop])

  // Media Session: refresh metadata when track or station changes
  useEffect(() => {
    if (!('mediaSession' in navigator)) return
    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack?.title,
      artist: currentTrack?.artist,
      album: currentStation?.name,
      ...(currentTrack?.coverUrl && { artwork: [{ src: currentTrack.coverUrl }] }),
    })
    if (currentTrack?.startedAt && currentTrack?.duration) {
      const elapsed = Date.now() / 1000 - currentTrack.startedAt
      navigator.mediaSession.setPositionState({
        duration: currentTrack.duration,
        position: Math.min(elapsed, currentTrack.duration),
        playbackRate: 1,
      })
    }
  }, [currentTrack, currentStation])

  // Handle volume and mute
  useEffect(() => {
    if (!mediaRef.current) return
    mediaRef.current.volume = muted ? 0 : volume / 100
  }, [volume, muted])

  return <video ref={mediaRef} playsInline style={{ display: 'none' }} />
}
