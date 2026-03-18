import { useEffect, useState } from 'react'
import { usePlayerStore } from '../store/playerStore'
import { VinylPlaceholder } from './VinylPlaceholder'
import { AntennaPlaceholder } from './AntennaPlaceholder'

export function NowPlaying() {
  const { currentTrack, isPlaying } = usePlayerStore()

  if (!currentTrack || !isPlaying)
    return (
      <div className="flex flex-col items-center gap-6 w-full max-w-sm px-8">
        <div className="w-80 h-80 opacity-30">
          <AntennaPlaceholder />
        </div>
        <p className="text-xs text-white/20 tracking-widest">SÉLECTIONNER UNE STATION</p>
      </div>
    )

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm px-8">
      {/* Pochette */}
      <div className="w-80 h-80 rounded shadow-2xl overflow-hidden bg-white/[0.03]">
        {currentTrack.coverUrl ? (
          <img
            src={currentTrack.coverUrl}
            alt={`Pochette de ${currentTrack.title}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <VinylPlaceholder />
        )}
      </div>

      {/* Infos */}
      <div className="flex flex-col items-center gap-1 text-center">
        <p className="text-white font-light text-lg leading-snug capitalize">
          {currentTrack.title}
        </p>
        <p className="text-white/40 text-xs tracking-widest uppercase">{currentTrack.artist}</p>
        {currentTrack.album && <p className="text-white/20 text-xs mt-1">{currentTrack.album}</p>}
      </div>
    </div>
  )
}

export function NowPlayingProgress() {
  const { currentTrack, isPlaying } = usePlayerStore()

  if (!currentTrack || !isPlaying || !currentTrack.startedAt || !currentTrack.duration) {
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
