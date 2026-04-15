import { ExternalLink } from 'lucide-react'
import { usePlayerStore } from '../store/playerStore'
import { PlayStopButton } from './PlayStopButton'
import { AudioPlayer } from './AudioPlayer'
import { VolumeControl } from './VolumeControl'

export function Player() {
  const { currentStation, status } = usePlayerStore()

  return (
    <div className="flex items-center justify-between px-6 h-14">
      {/* Station active */}
      {currentStation?.websiteUrl ? (
        <a
          href={currentStation.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-text-muted tracking-widest w-40 truncate hover:text-text"
        >
          <span className="truncate">{currentStation.name}</span>
          <ExternalLink size={10} className="shrink-0" />
        </a>
      ) : (
        <span className="text-xs text-text-muted tracking-widest w-40 truncate">
          {currentStation?.name ?? ''}
        </span>
      )}

      {/* Bouton play/stop */}
      <PlayStopButton />

      {/* Volume */}
      <div className="w-40 hidden md:flex justify-end">
        <VolumeControl />
      </div>

      {currentStation && status !== 'stopped' && <AudioPlayer />}
    </div>
  )
}
