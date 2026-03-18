import { useEffect, useRef } from 'react'
import { usePlayerStore } from '../store/playerStore'

export function useAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { currentStation, isPlaying, volume, setIsPlaying } = usePlayerStore()

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
    }
  }, [])

  useEffect(() => {
    if (!audioRef.current || !currentStation) return

    audioRef.current.src = currentStation.streamUrl
    audioRef.current.load()

    if (isPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false))
    } else {
      audioRef.current.pause()
      audioRef.current.src = ''
      audioRef.current.load()
    }
  }, [currentStation, isPlaying, setIsPlaying])

  useEffect(() => {
    if (!audioRef.current) return
    audioRef.current.volume = volume / 100
  }, [volume])

  return audioRef
}
