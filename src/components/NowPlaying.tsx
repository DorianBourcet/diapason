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

  if (!currentTrack || status !== 'playing')
    return (
      <div className="flex flex-col items-center gap-6 w-full max-w-sm px-8 min-h-0">
        <div className="opacity-30" style={coverSize}>
          <AntennaPlaceholder />
        </div>
        <p className="text-xs text-white/20 tracking-widest">SÉLECTIONNER UNE STATION</p>
      </div>
    )

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm px-8 min-h-0">
      {/* Pochette */}
      <div
        className="rounded-lg shadow-2xl overflow-hidden bg-white/[0.03] shrink-0"
        style={coverSize}
      >
        {currentTrack.coverUrl && !imageLoadError ? (
          <img
            src={currentTrack.coverUrl}
            alt={`Pochette de ${currentTrack.title}`}
            className="w-full h-full object-cover"
            onError={() => setImageLoadError(true)}
            onLoad={() => setImageLoadError(false)}
          />
        ) : (
          <VinylPlaceholder />
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col items-center gap-1 w-full overflow-hidden min-h-20">
        <MarqueeText
          text={currentTrack.title ?? ''}
          className="text-white font-light text-lg leading-snug lowercase w-full text-center"
        />
        <MarqueeText
          text={currentTrack.artist ?? ''}
          className="text-white/40 text-xs tracking-widest uppercase w-full text-center"
        />
        {currentTrack.album && (
          <MarqueeText
            text={currentTrack.album}
            className="text-white/20 text-xs mt-1 w-full text-center"
          />
        )}
      </div>
    </div>
  )
}

export function NowPlayingProgress() {
  const { currentTrack, status } = usePlayerStore()

  if (!currentTrack || status !== 'playing' || !currentTrack.startedAt || !currentTrack.duration) {
    return <div className="h-px bg-white/5 w-full" />
  }

  return <ProgressBar startedAt={currentTrack.startedAt} duration={currentTrack.duration} />
}

function ProgressBar({ startedAt, duration }: { startedAt: number; duration: number }) {
  const progress = useProgress(startedAt, duration)

  return (
    <div
      className="w-full h-px bg-white/10 overflow-hidden"
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="h-full bg-white/40" style={{ width: `${progress}%` }} />
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
