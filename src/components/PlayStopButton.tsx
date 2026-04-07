import { usePlayerStore } from '../store/playerStore'

export function PlayStopButton() {
  const { currentStation, status, setStatus } = usePlayerStore()

  function handlePlayStop() {
    setStatus(status === 'playing' ? 'stopped' : 'loading')
  }

  return (
    <button
      onClick={handlePlayStop}
      aria-label={status !== 'playing' ? 'Lecture' : 'Stop'}
      className="w-11 h-11 md:w-8 md:h-8 shrink-0 rounded-full border border-border flex items-center justify-center hover:border-accent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      disabled={!currentStation}
    >
      {status === 'playing' ? (
        <span className="w-3 h-3 bg-text" />
      ) : (
        <span className="w-0 h-0 border-y-6 border-y-transparent border-l-[10px] border-l-text ml-0.5" />
      )}
    </button>
  )
}
