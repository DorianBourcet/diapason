import { useRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { NowPlaying, NowPlayingProgress } from './NowPlaying'
import { Player } from './Player'

interface PlayerDrawerProps {
  open: boolean
  onClose: () => void
}

export function PlayerDrawer({ open, onClose }: PlayerDrawerProps) {
  const startYRef = useRef<number | null>(null)
  const currentTranslateRef = useRef(0)
  const drawerRef = useRef<HTMLDivElement>(null)

  function onTouchStart(e: React.TouchEvent) {
    startYRef.current = e.touches[0].clientY
    currentTranslateRef.current = 0
    if (drawerRef.current) {
      drawerRef.current.style.transition = 'none'
    }
  }

  function onTouchMove(e: React.TouchEvent) {
    if (startYRef.current === null) return
    const delta = e.touches[0].clientY - startYRef.current
    if (delta < 0) return
    currentTranslateRef.current = delta
    if (drawerRef.current) {
      drawerRef.current.style.transform = `translateY(${delta}px)`
    }
  }

  function onTouchEnd() {
    if (drawerRef.current) {
      drawerRef.current.style.transition = ''
      drawerRef.current.style.transform = ''
    }
    if (currentTranslateRef.current > 100) {
      onClose()
    }
    startYRef.current = null
    currentTranslateRef.current = 0
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 md:hidden ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Lecteur"
        className={`fixed inset-0 z-50 bg-bg flex flex-col transition-transform duration-300 ease-out md:hidden ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="flex items-center justify-between px-5 pt-4 pb-2 shrink-0">
          <div className="w-8 h-0.5 mx-auto rounded-full bg-text-muted opacity-40" />
          <button
            onClick={onClose}
            aria-label="Fermer le lecteur"
            className="absolute right-4 top-4 p-1.5 text-text-muted hover:text-text transition-colors"
          >
            <ChevronDown size={20} />
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center overflow-hidden min-h-0">
          <NowPlaying />
        </div>

        <NowPlayingProgress />

        <div className="shrink-0 border-t border-border bg-bg-elevated">
          <Player />
        </div>
      </div>
    </>
  )
}
