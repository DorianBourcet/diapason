import { usePlayerStore } from '../store/playerStore'
import { PlayStopButton } from './PlayStopButton'

interface MiniPlayerProps {
  onOpen: () => void
}

export function MiniPlayer({ onOpen }: MiniPlayerProps) {
  const currentStation = usePlayerStore((s) => s.currentStation)
  const currentTrack = usePlayerStore((s) => s.currentTrack)
  const status = usePlayerStore((s) => s.status)

  if (!currentStation) return null

  const label = currentTrack?.title
    ? `${currentTrack.title}${currentTrack.artist ? ` — ${currentTrack.artist}` : ''}`
    : currentStation.name

  return (
    <div
      onClick={onOpen}
      className="flex items-center gap-3 px-5 h-14 border border-border bg-bg-elevated cursor-pointer shrink-0 rounded-xl shadow-lg"
    >
      <div className="flex-1 min-w-0">
        <p className="text-xs tracking-widest text-text-muted truncate">{currentStation.name}</p>
        {status === 'playing' && currentTrack?.title && (
          <p className="text-xs text-text truncate">{label}</p>
        )}
      </div>

      <div onClick={(e) => e.stopPropagation()}>
        <PlayStopButton />
      </div>
    </div>
  )
}
