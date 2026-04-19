import { useEffect, useState } from 'react'
import { AlertCircle, X } from 'lucide-react'
import { usePlayerStore } from '../store/playerStore'

const DURATION = 5000

export function Toast() {
  const errorMessage = usePlayerStore((s) => s.errorMessage)
  const setErrorMessage = usePlayerStore((s) => s.setErrorMessage)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (!errorMessage) return

    setPaused(false)
    let remaining = DURATION
    let startedAt = Date.now()
    let timerId: ReturnType<typeof setTimeout> | null = null

    const schedule = () => {
      timerId = setTimeout(() => setErrorMessage(null), remaining)
      startedAt = Date.now()
    }

    const pause = () => {
      if (timerId !== null) {
        clearTimeout(timerId)
        timerId = null
        remaining -= Date.now() - startedAt
      }
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        pause()
        setPaused(true)
      } else {
        schedule()
        setPaused(false)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    schedule()

    return () => {
      if (timerId !== null) clearTimeout(timerId)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [errorMessage, setErrorMessage])

  return (
    <div
      className={`fixed bottom-24 left-0 md:left-48 right-0 flex justify-center z-50 px-4 transition-all duration-300 ${
        errorMessage
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-2 pointer-events-none'
      }`}
      role="alert"
      aria-live="assertive"
    >
      <div className="relative overflow-hidden flex items-center gap-3 bg-text text-bg px-4 py-3 rounded-xl shadow-lg text-sm max-w-sm w-full">
        <AlertCircle size={16} className="shrink-0 text-red-400" />
        <span className="flex-1">{errorMessage}</span>
        <button
          onClick={() => setErrorMessage(null)}
          aria-label="Fermer"
          className="shrink-0 opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
        >
          <X size={14} />
        </button>
        <div
          key={errorMessage}
          className="absolute bottom-0 left-0 right-0 h-1 bg-accent opacity-60 origin-left"
          style={{
            animationName: 'toast-progress',
            animationDuration: `${DURATION}ms`,
            animationTimingFunction: 'linear',
            animationFillMode: 'forwards',
            animationPlayState: paused ? 'paused' : 'running',
          }}
        />
      </div>
    </div>
  )
}
