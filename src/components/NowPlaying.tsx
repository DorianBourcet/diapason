import { useEffect, useState } from 'react'
import { usePlayerStore } from '../store/playerStore'
import { VinylPlaceholder } from './VinylPlaceholder'
import { AntennaPlaceholder } from './AntennaPlaceholder'
import { MarqueeText } from './MarqueeText'

export function NowPlaying() {
  const { currentTrack, status } = usePlayerStore()
  const [imageLoadError, setImageLoadError] = useState(false)

  useEffect(() => {
    setImageLoadError(false)
  }, [currentTrack])

  const coverSize = { width: 'min(320px, 50vh)', height: 'min(320px, 50vh)' }

  // Playing
  if (status === 'playing') {
    return (
      <div className="flex flex-col items-center gap-6 w-full max-w-sm px-8 min-h-0">
        <div
          className="rounded-lg shadow-2xl overflow-hidden bg-bg-elevated shrink-0"
          style={coverSize}
        >
          {currentTrack?.coverUrl && !imageLoadError ? (
            <img
              src={currentTrack.coverUrl}
              alt={`Pochette de ${currentTrack?.title}`}
              className="w-full h-full object-cover"
              onError={() => setImageLoadError(true)}
              onLoad={() => setImageLoadError(false)}
            />
          ) : (
            <VinylPlaceholder />
          )}
        </div>

        <div className="flex flex-col items-center gap-1 w-full overflow-hidden min-h-20">
          <MarqueeText
            text={currentTrack?.title ?? ''}
            className="text-text font-light text-lg leading-snug lowercase w-full text-center"
          />
          <MarqueeText
            text={currentTrack?.artist ?? ''}
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

  // Loading station
  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center gap-6 w-full max-w-sm px-8 min-h-0 animate-pulse">
        <div className="rounded-lg bg-bg-elevated shrink-0" style={coverSize} />
        <div className="flex flex-col items-center gap-3 w-full min-h-20">
          <div className="h-4 rounded bg-bg-elevated w-2/3" />
          <div className="h-3 rounded bg-bg-elevated w-1/3" />
        </div>
      </div>
    )
  }

  // No playing station
  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm px-8 min-h-0">
      <div className="opacity-30" style={coverSize}>
        <AntennaPlaceholder />
      </div>
      <p className="text-xs text-text-muted tracking-widest">SÉLECTIONNER UNE STATION</p>
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
  const progress = useProgress(startedAt, duration)

  return (
    <div
      className="w-full h-px bg-border overflow-hidden"
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="h-full bg-accent" style={{ width: `${progress}%` }} />
    </div>
  )
}

function useProgress(startedAt: number, duration: number): number {
  const [progress, setProgress] = useState(calculateProgress(startedAt, duration))

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(calculateProgress(startedAt, duration))
    }, 1000)

    return () => clearInterval(interval)
  }, [startedAt, duration])

  return progress
}

function calculateProgress(startedAt: number, duration: number): number {
  const now = Date.now() / 1000
  const elapsed = now - startedAt
  return Math.min(Math.round((elapsed / duration) * 100), 100)
}
