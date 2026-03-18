import { usePlayerStore } from '../store/playerStore'

export function Player() {
  const { currentStation, isPlaying, volume, setIsPlaying, setVolume } = usePlayerStore()

  function handlePlayPause() {
    setIsPlaying(!isPlaying)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setVolume(parseFloat(e.target.value) * 100)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowLeft') {
      const newVolume = Math.ceil(volume / 10) * 10 - 10
      setVolume(Math.max(0, newVolume))
    } else if (e.key === 'ArrowRight') {
      const newVolume = Math.floor(volume / 10) * 10 + 10
      setVolume(Math.min(newVolume, 100))
    }
  }

  return (
    <div className="flex items-center justify-between px-6 h-14">
      {/* Station active */}
      <span className="text-xs text-white/30 tracking-widest w-32">
        {currentStation?.name ?? ''}
      </span>

      {/* Bouton play/pause */}
      <button
        onClick={handlePlayPause}
        aria-label={isPlaying ? 'Stop' : 'Lecture'}
        className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center hover:border-white/30 transition-colors"
      >
        {isPlaying ? (
          <span className="flex gap-0.5">
            <span className="w-0.5 h-3 bg-white/70 rounded-full" />
            <span className="w-0.5 h-3 bg-white/70 rounded-full" />
          </span>
        ) : (
          <span className="w-0 h-0 border-y-4 border-y-transparent border-l-[7px] border-l-white/70 ml-0.5" />
        )}
      </button>

      {/* Volume */}
      <div className="flex items-center gap-3 w-32 justify-end">
        <span className="text-xs text-white/20 tracking-widest">VOL</span>
        <input
          id="volume"
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume / 100}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="w-20 accent-white/60 cursor-pointer"
        />
      </div>
    </div>
  )
}
