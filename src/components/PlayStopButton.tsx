import { usePlayerStore } from '../store/playerStore'

export function PlayStopButton() {
  const { currentStation, isPlaying, setIsPlaying } = usePlayerStore()

  function handlePlayStop() {
    setIsPlaying(!isPlaying)
  }

  return (
    <button
      onClick={handlePlayStop}
      aria-label={isPlaying ? 'Stop' : 'Lecture'}
      className="w-8 h-8 rounded-full border enabled:border-white/10 flex items-center justify-center enabled:hover:border-white/30 disabled:border-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      disabled={!currentStation}
    >
      {isPlaying ? (
        <span className="w-3 h-3 bg-white/70" />
      ) : (
        <span className="w-0 h-0 border-y-6 border-y-transparent border-l-[10px] border-l-white/70 ml-0.5" />
      )}
    </button>
  )
}
