import { BedDouble } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { usePlayerStore } from '../store/playerStore'
import { useSleepTimer } from '../hooks/useSleepTimer'

const TIMER_OPTIONS = [
  { label: 'Dans 60 min', seconds: 60 * 60 },
  { label: 'Dans 45 min', seconds: 45 * 60 },
  { label: 'Dans 30 min', seconds: 30 * 60 },
  { label: 'Dans 15 min', seconds: 15 * 60 },
  { label: 'Dans 10 min', seconds: 10 * 60 },
  { label: 'Dans 5 min', seconds: 5 * 60 },
]

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function SleepTimerControl() {
  const { secondsRemaining, isActive, canUseEndOfTrack, endOfTrackSeconds, startTimer, cancel } =
    useSleepTimer()
  const status = usePlayerStore((s) => s.status)
  const isPlaying = status === 'playing' || status === 'loading'
  const [menuOpen, setMenuOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  useEffect(() => {
    if (!isPlaying) setMenuOpen(false)
  }, [isPlaying])

  function handleOptionClick(seconds: number) {
    startTimer(seconds)
    setMenuOpen(false)
  }

  function handleCancel() {
    cancel()
    setMenuOpen(false)
  }

  return (
    <div ref={containerRef} className="relative flex items-center">
      {/* Popover menu */}
      <div
        className={`
          absolute bottom-full mb-3 right-0
          flex flex-col
          bg-bg-elevated border border-border rounded-xl py-1
          min-w-36
          transition-all duration-150
          ${menuOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-1 pointer-events-none'}
        `}
      >
        {TIMER_OPTIONS.map((opt) => (
          <button
            key={opt.seconds}
            onClick={() => handleOptionClick(opt.seconds)}
            className="px-4 py-2 text-sm text-left text-text-muted hover:text-text hover:bg-border/30 transition-colors cursor-pointer"
          >
            {opt.label}
          </button>
        ))}

        {/* End of track option */}
        <button
          onClick={() =>
            canUseEndOfTrack && endOfTrackSeconds ? handleOptionClick(endOfTrackSeconds) : undefined
          }
          disabled={!canUseEndOfTrack}
          className={`px-4 py-2 text-sm text-left transition-colors ${
            canUseEndOfTrack
              ? 'text-text-muted hover:text-text hover:bg-border/30 cursor-pointer'
              : 'text-text-muted opacity-40 cursor-not-allowed'
          }`}
        >
          À la fin du titre
        </button>

        {/* Cancel — only when a timer is active */}
        {isActive && (
          <>
            <div className="my-1 border-t border-border" />
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm text-left text-accent opacity-75 hover:opacity-100 hover:bg-border/30 transition-colors cursor-pointer"
            >
              Annuler la mise en veille
            </button>
          </>
        )}
      </div>

      {/* Toggle button */}
      <button
        onClick={() => isPlaying && setMenuOpen((v) => !v)}
        disabled={!isPlaying}
        aria-label="Minuteur de mise en veille"
        className={`flex items-center gap-1.5 h-11 md:h-8 px-1 transition-colors ${
          !isPlaying
            ? 'text-text-muted opacity-30 cursor-not-allowed'
            : isActive
              ? 'text-accent cursor-pointer'
              : 'text-text-muted hover:text-text cursor-pointer'
        }`}
      >
        <BedDouble size={16} />
        {isActive && secondsRemaining !== null && (
          <span className="text-xs tabular-nums font-medium">{formatTime(secondsRemaining)}</span>
        )}
      </button>
    </div>
  )
}
