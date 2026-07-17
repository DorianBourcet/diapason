import { Heart, HeartCrack } from 'lucide-react'
import { usePlayerStore } from '../store/playerStore'
import { PlayStopButton } from './PlayStopButton'
import { VolumeControl } from './VolumeControl'
import { SleepTimerControl } from './SleepTimerControl'
import { MarqueeText } from './MarqueeText'

export function Player() {
  const currentStation = usePlayerStore((s) => s.currentStation)
  const toggleFavorite = usePlayerStore((s) => s.toggleFavorite)
  const favorites = usePlayerStore((s) => s.favorites)
  const isFavorite = !!currentStation && favorites.includes(currentStation.id)

  return (
    <div className="flex items-center justify-between gap-3 px-6 h-14">
      {/* Active station */}
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        {currentStation?.websiteUrl ? (
          <a
            href={currentStation.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 min-w-0 text-xs text-text-muted tracking-widest hover:text-text"
          >
            <MarqueeText text={currentStation.name} className="min-w-0" />
          </a>
        ) : (
          <MarqueeText
            text={currentStation?.name ?? ''}
            className="min-w-0 text-xs text-text-muted tracking-widest"
          />
        )}
        {currentStation && (
          <button
            onClick={() => toggleFavorite(currentStation.id)}
            aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            className={`group relative shrink-0 inline-flex h-4 w-4 items-center justify-center cursor-pointer transition-transform active:scale-90 ${
              isFavorite ? 'text-accent' : 'text-text-muted hover:text-accent'
            }`}
          >
            {isFavorite ? (
              <>
                <Heart
                  size={16}
                  fill="currentColor"
                  className="absolute inset-0 m-auto transition-opacity group-hover:opacity-0 group-focus-visible:opacity-0 group-active:opacity-0"
                />
                <HeartCrack
                  size={16}
                  style={{ clipPath: 'inset(0 50% 0 0)' }}
                  className="absolute inset-0 m-auto opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 group-active:opacity-100 motion-safe:group-hover:animate-[heart-break-left_0.4s_ease-out_forwards] motion-safe:group-focus-visible:animate-[heart-break-left_0.4s_ease-out_forwards] motion-safe:group-active:animate-[heart-break-left_0.4s_ease-out_forwards]"
                />
                <HeartCrack
                  size={16}
                  style={{ clipPath: 'inset(0 0 0 50%)' }}
                  className="absolute inset-0 m-auto opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 group-active:opacity-100 motion-safe:group-hover:animate-[heart-break-right_0.4s_ease-out_forwards] motion-safe:group-focus-visible:animate-[heart-break-right_0.4s_ease-out_forwards] motion-safe:group-active:animate-[heart-break-right_0.4s_ease-out_forwards]"
                />
              </>
            ) : (
              <>
                <span
                  aria-hidden
                  className="absolute inset-0 m-auto rounded-full border border-accent opacity-0 pointer-events-none motion-safe:group-hover:animate-[heart-wave_1.2s_ease-out_infinite] motion-safe:group-focus-visible:animate-[heart-wave_1.2s_ease-out_infinite] motion-safe:group-active:animate-[heart-wave_1.2s_ease-out_infinite]"
                />
                <Heart
                  size={16}
                  fill="none"
                  className="relative motion-safe:group-hover:animate-[heart-beat_0.8s_ease-in-out_infinite] motion-safe:group-focus-visible:animate-[heart-beat_0.8s_ease-in-out_infinite] motion-safe:group-active:animate-[heart-beat_0.8s_ease-in-out_infinite]"
                />
              </>
            )}
          </button>
        )}
      </div>

      {/* Play/stop button */}
      <PlayStopButton />

      {/* Right controls */}
      <div className="flex-1 min-w-0 flex items-center justify-end gap-1">
        <SleepTimerControl />
        <div className="hidden md:flex">
          <VolumeControl />
        </div>
      </div>
    </div>
  )
}
