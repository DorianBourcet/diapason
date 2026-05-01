import { useEffect, useRef, useState } from 'react'
import { usePlayerStore } from '../store/playerStore'

export function useSleepTimer() {
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null)
  const secondsRef = useRef<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const { currentStation, currentTrack, status, setStatus } = usePlayerStore()

  function cancel() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = null
    secondsRef.current = null
    setSecondsRemaining(null)
  }

  function startTimer(seconds: number) {
    cancel()
    secondsRef.current = seconds
    setSecondsRemaining(seconds)
    intervalRef.current = setInterval(() => {
      secondsRef.current = (secondsRef.current ?? 1) - 1
      if (secondsRef.current <= 0) {
        cancel()
        setStatus('stopped')
      } else {
        setSecondsRemaining(secondsRef.current)
      }
    }, 1000)
  }

  const stationId = currentStation?.id
  useEffect(() => {
    if (secondsRef.current !== null) cancel()
  }, [stationId])

  useEffect(() => {
    if (status === 'stopped' && secondsRef.current !== null) cancel()
  }, [status])

  useEffect(() => cancel, [])

  const endOfTrackSeconds =
    currentTrack?.startedAt && currentTrack?.duration
      ? Math.floor(currentTrack.startedAt + currentTrack.duration - Date.now() / 1000)
      : null
  const canUseEndOfTrack = endOfTrackSeconds !== null && endOfTrackSeconds > 0

  return {
    secondsRemaining,
    isActive: secondsRemaining !== null,
    canUseEndOfTrack,
    endOfTrackSeconds,
    startTimer,
    cancel,
  }
}
