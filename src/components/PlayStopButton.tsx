import { usePlayerStore } from '../store/playerStore'

export function PlayStopButton() {
  const { currentStation, status, setStatus } = usePlayerStore()

  function handlePlayStop() {
    setStatus(status === 'playing' ? 'stopped' : 'playing')
  }

  return (
    <button
      onClick={handlePlayStop}
      aria-label={status !== 'playing' ? 'Lecture' : 'Stop'}
      className="w-11 h-11 md:w-8 md:h-8 shrink-0 rounded-full border enabled:border-white/10 flex items-center justify-center enabled:hover:border-white/30 cursor-pointer disabled:border-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      disabled={!currentStation}
    >
      {status === 'playing' ? (
        <span className="w-3 h-3 bg-white/70" />
      ) : (
        <span className="w-0 h-0 border-y-6 border-y-transparent border-l-[10px] border-l-white/70 ml-0.5" />
      )}
    </button>
  )
}
