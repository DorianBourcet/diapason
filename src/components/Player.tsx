import { ExternalLink } from 'lucide-react'
import { usePlayerStore } from '../store/playerStore'
import { PlayStopButton } from './PlayStopButton'
import { VolumeControl } from './VolumeControl'
import { SleepTimerControl } from './SleepTimerControl'

export function Player() {
  const currentStation = usePlayerStore((s) => s.currentStation)

  return (
    <div className="flex items-center justify-between px-6 h-14">
      {/* Active station */}
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

      {/* Play/stop button */}
      <PlayStopButton />

      {/* Right controls */}
      <div className="w-40 flex items-center justify-end gap-1">
        <SleepTimerControl />
        <div className="hidden md:flex">
          <VolumeControl />
        </div>
      </div>
    </div>
  )
}
