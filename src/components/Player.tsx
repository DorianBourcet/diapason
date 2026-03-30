import { usePlayerStore } from '../store/playerStore'
import { PlayStopButton } from './PlayStopButton'
import { AudioPlayer } from './AudioPlayer'
import type { ChangeEvent, KeyboardEvent } from 'react'

export function Player() {
  const { currentStation, volume, setVolume, status } = usePlayerStore()

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setVolume(parseFloat(e.target.value) * 100)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
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

      {/* Bouton play/stop */}
      <PlayStopButton />

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
      {currentStation && status !== 'stopped' && <AudioPlayer />}
    </div>
  )
}
