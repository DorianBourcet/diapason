import { usePlayerStore } from '../store/playerStore'
import { PlayStopButton } from './PlayStopButton'
import { AudioPlayer } from './AudioPlayer'
import { VolumeControl } from './VolumeControl'

export function Player() {
  const { currentStation, status } = usePlayerStore()

  return (
    <div className="flex items-center justify-between px-6 h-14">
      {/* Station active */}
      <span className="text-xs text-text-muted tracking-widest w-32 truncate">
        {currentStation?.name ?? ''}
      </span>

      {/* Bouton play/stop */}
      <PlayStopButton />

      {/* Volume */}
      <div className="w-32 hidden md:flex justify-end">
        <VolumeControl />
      </div>

      {currentStation && status !== 'stopped' && <AudioPlayer />}
    </div>
  )
}
