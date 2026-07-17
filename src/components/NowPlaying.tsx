import { useEffect, useRef, useState } from 'react'
import { usePlayerStore } from '../store/playerStore'
import { StationNameCover } from './StationNameCover'
import { AntennaPlaceholder } from './AntennaPlaceholder'
import { MarqueeText } from './MarqueeText'

const METADATA_GRACE_MS = 2000

export function NowPlaying() {
  const { currentStation, currentTrack, status, metadataStatus } = usePlayerStore()
  const [imageLoadError, setImageLoadError] = useState(false)
  const [loadedCoverUrl, setLoadedCoverUrl] = useState<string | null>(null)
  const [graceExpired, setGraceExpired] = useState(false)

  useEffect(() => {
    setImageLoadError(false)
  }, [currentTrack])

  useEffect(() => {
    if (status !== 'playing' || metadataStatus !== 'pending') {
      setGraceExpired(false)
      return
    }
    const timer = setTimeout(() => setGraceExpired(true), METADATA_GRACE_MS)
    return () => clearTimeout(timer)
  }, [status, metadataStatus, currentStation?.id])

  const coverSize = {
    width: 'min(500px, calc(100vh - 200px), calc(100vw - 4rem))',
    height: 'min(500px, calc(100vh - 200px), calc(100vw - 4rem))',
  }

  const stationName = currentStation?.name ?? ''
  const hasMetadata = Boolean(currentTrack?.title || currentTrack?.artist || currentTrack?.album)

  const coverUrl = currentTrack?.coverUrl
  const coverReady = coverUrl != null && loadedCoverUrl === coverUrl

  const showSkeleton =
    status === 'loading' || (status === 'playing' && metadataStatus === 'pending' && !graceExpired)

  if (showSkeleton) {
    return (
      <div className="flex flex-col items-center gap-6 w-full max-w-xl px-8 min-h-0 animate-pulse">
        <div className="rounded-lg bg-bg-elevated shrink-0" style={coverSize} />
        <div className="flex flex-col items-center gap-3 w-full min-h-20">
          <div className="h-4 rounded bg-bg-elevated w-2/3" />
          <div className="h-3 rounded bg-bg-elevated w-1/3" />
        </div>
      </div>
    )
  }

  // Playing
  if (status === 'playing') {
    return (
      <div className="flex flex-col items-center gap-6 w-full max-w-xl px-8 min-h-0">
        <div
          className="relative rounded-lg shadow-[var(--cover-shadow)] overflow-hidden bg-bg-elevated shrink-0"
          style={coverSize}
        >
          {coverUrl && !imageLoadError ? (
            <>
              <img
                key={coverUrl}
                ref={(el) => {
                  if (el?.complete && el.naturalWidth > 0) setLoadedCoverUrl(coverUrl)
                }}
                src={coverUrl}
                alt={`Pochette de ${currentTrack?.title}`}
                className={`w-full h-full object-cover ${coverReady ? '' : 'opacity-0'}`}
                onError={() => setImageLoadError(true)}
                onLoad={() => setLoadedCoverUrl(coverUrl)}
              />
              {!coverReady && <div className="absolute inset-0 bg-bg-elevated animate-pulse" />}
            </>
          ) : (
            <StationNameCover name={stationName} />
          )}
        </div>

        <div className="flex flex-col items-center gap-1 w-full overflow-hidden min-h-20">
          <MarqueeText
            text={currentTrack?.title ?? (hasMetadata ? '' : stationName)}
            className="text-text font-light text-lg leading-snug w-full text-center"
          />
          <MarqueeText
            text={currentTrack?.artist ?? (currentTrack?.album ? '' : stationName)}
            className="text-text-muted text-xs tracking-widest uppercase w-full text-center"
          />
          {currentTrack?.album && (
            <MarqueeText
              text={currentTrack.album}
              className="text-text-muted opacity-50 text-xs mt-1 w-full text-center"
            />
          )}
        </div>
      </div>
    )
  }

  // No playing station
  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-xl px-8 min-h-0">
      <div className="opacity-30" style={coverSize}>
        <AntennaPlaceholder />
      </div>
    </div>
  )
}

export function NowPlayingProgress() {
  const { currentTrack, status } = usePlayerStore()

  if (!currentTrack || status !== 'playing' || !currentTrack.startedAt || !currentTrack.duration) {
    return <div className="h-px w-full bg-border" />
  }

  return <ProgressBar startedAt={currentTrack.startedAt} duration={currentTrack.duration} />
}

function ProgressBar({ startedAt, duration }: { startedAt: number; duration: number }) {
  const CATCHUP_MS = 700
  const mountElapsed = useRef(Date.now() / 1000 - startedAt)
  const linearDelayRef = useRef(0)
  const [phase, setPhase] = useState<'start' | 'catchup' | 'linear'>('start')

  useEffect(() => {
    mountElapsed.current = Date.now() / 1000 - startedAt
    setPhase('start')
    const raf = requestAnimationFrame(() => setPhase((p) => (p === 'start' ? 'catchup' : p)))
    const timer = setTimeout(() => {
      linearDelayRef.current = Date.now() / 1000 - startedAt
      setPhase('linear')
    }, CATCHUP_MS)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(timer)
    }
  }, [startedAt])

  const initialProgress = Math.min(
    100,
    ((mountElapsed.current + CATCHUP_MS / 1000) / duration) * 100,
  )

  const innerStyle: React.CSSProperties =
    phase === 'linear'
      ? {
          animationName: 'progress-bar',
          animationDuration: `${duration}s`,
          animationDelay: `-${linearDelayRef.current}s`,
          animationTimingFunction: 'linear',
          animationFillMode: 'both',
        }
      : {
          width: phase === 'catchup' ? `${initialProgress}%` : '0%',
          transition:
            phase === 'catchup' ? `width ${CATCHUP_MS}ms cubic-bezier(0.15, 0.85, 0.3, 1)` : 'none',
        }

  return (
    <div
      className="w-full h-px bg-border overflow-hidden"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="h-full bg-accent" style={innerStyle} />
    </div>
  )
}
