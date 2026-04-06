import { useRef, useState } from 'react'
import { usePlayerStore } from '../store/playerStore'

export function VolumeControl() {
  const { volume, muted, setVolume, toggleMute } = usePlayerStore()
  const [popoverVisible, setPopoverVisible] = useState(false)
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const effectiveVolume = muted ? 0 : volume

  function handleMouseEnter() {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current)
    setPopoverVisible(true)
  }

  function handleMouseLeave() {
    hideTimeoutRef.current = setTimeout(() => setPopoverVisible(false), 200)
  }

  function handleSliderChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseFloat(e.target.value)
    setVolume(val)
  }

  return (
    <div
      className="relative flex items-center justify-end"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Vertical slider popover */}
      <div
        className={`
          absolute bottom-full mb-3 left-1/2 -translate-x-1/2
          flex flex-col items-center gap-2
          bg-bg-elevated border border-border rounded-xl px-3 py-4
          transition-all duration-150
          ${popoverVisible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-1 pointer-events-none'}
        `}
      >
        {/* Value */}
        <span className="text-[10px] text-text-muted tabular-nums w-6 text-center">
          {Math.round(effectiveVolume)}
        </span>

        {/* Vertical slider */}
        <div className="relative h-24 flex items-center justify-center">
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={effectiveVolume}
            onChange={handleSliderChange}
            className="appearance-none cursor-pointer"
            style={{
              writingMode: 'vertical-lr',
              direction: 'rtl',
              width: '4px',
              height: '96px',
              background: `linear-gradient(to top, var(--color-accent) ${effectiveVolume}%, var(--color-border) ${effectiveVolume}%)`,
              borderRadius: '9999px',
              outline: 'none',
              border: 'none',
              WebkitAppearance: 'slider-vertical',
            }}
          />
        </div>
      </div>

      {/* Volume button */}
      <button
        onClick={toggleMute}
        aria-label={muted ? 'Réactiver le son' : 'Couper le son'}
        className="flex items-center justify-center w-11 h-11 md:w-8 md:h-8 text-text-muted hover:text-text transition-colors cursor-pointer"
      >
        <VolumeIcon volume={effectiveVolume} />
      </button>
    </div>
  )
}

function VolumeIcon({ volume }: { volume: number }) {
  if (volume === 0) {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 5.5H4.5L8 2.5V13.5L4.5 10.5H2V5.5Z" fill="currentColor" fillOpacity="0.7" />
        <line x1="11" y1="5.5" x2="15" y2="10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="15" y1="5.5" x2="11" y2="10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  }

  if (volume < 50) {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 5.5H4.5L8 2.5V13.5L4.5 10.5H2V5.5Z" fill="currentColor" fillOpacity="0.7" />
        <path d="M10 6.5C10.8 7 11 7.5 11 8C11 8.5 10.8 9 10 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  }

  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 5.5H4.5L8 2.5V13.5L4.5 10.5H2V5.5Z" fill="currentColor" fillOpacity="0.7" />
      <path d="M10 6.5C10.8 7 11 7.5 11 8C11 8.5 10.8 9 10 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M11.5 4.5C13.2 5.5 14 6.7 14 8C14 9.3 13.2 10.5 11.5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
