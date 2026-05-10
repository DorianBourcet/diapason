import { useEffect, useState } from 'react'
import { useNowPlaying } from './hooks/useNowPlaying'
import { StationBrowser } from './components/StationBrowser'
import { ThemeSelector } from './components/ThemeSelector'
import { MiniPlayer } from './components/MiniPlayer'
import { PlayerDrawer } from './components/PlayerDrawer'
import { Player } from './components/Player'
import { AudioPlayer } from './components/AudioPlayer'
import { NowPlaying, NowPlayingProgress } from './components/NowPlaying'
import { Toast } from './components/Toast'
import { usePlayerStore } from './store/playerStore'

export default function App() {
  useNowPlaying()
  const [playerDrawerOpen, setPlayerDrawerOpen] = useState(false)
  const theme = usePlayerStore((s) => s.theme)

  useEffect(() => {
    const root = document.documentElement
    const mq = window.matchMedia('(prefers-color-scheme: dark)')

    const apply = () => {
      const resolved = theme === 'system' ? (mq.matches ? 'dark' : 'light') : theme
      root.classList.remove('light', 'dark')
      root.classList.add(resolved)

      const bgColor = getComputedStyle(root).getPropertyValue('--color-bg').trim()

      let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
      if (!meta) {
        meta = document.createElement('meta')
        meta.name = 'theme-color'
        document.head.appendChild(meta)
      }
      meta.content = bgColor
    }

    apply()

    if (theme === 'system') {
      mq.addEventListener('change', apply)
      return () => mq.removeEventListener('change', apply)
    }
  }, [theme])

  return (
    <div className="flex h-dvh overflow-hidden bg-bg text-text">
      {/* Desktop */}
      <aside className="hidden md:flex w-72 shrink-0 flex-col pt-4 px-4 gap-4 min-h-0 border-r border-border">
        <div className="flex items-center justify-between px-2 mt-2 mb-2 shrink-0">
          <span className="text-xs tracking-[0.3em] font-light text-text">DIAPASON</span>
          <ThemeSelector />
        </div>
        <div className="min-h-0 flex-1 pb-4">
          <StationBrowser />
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between px-5 h-12 shrink-0 border-b border-border">
          <span className="text-xs tracking-[0.3em] font-light text-text">DIAPASON</span>
          <ThemeSelector />
        </header>

        {/* Mobile station browser */}
        <div className="md:hidden flex-1 flex flex-col min-h-0 overflow-hidden px-4 pt-4 pb-2">
          <StationBrowser />
        </div>

        {/* Mobile mini player */}
        <div className="fixed bottom-0 inset-x-0 z-30 md:hidden px-3 pb-4">
          <MiniPlayer onOpen={() => setPlayerDrawerOpen(true)} />
        </div>

        {/* Desktop now playing */}
        <div className="hidden md:flex flex-1 items-center justify-center overflow-hidden min-h-0">
          <NowPlaying />
        </div>
        <div className="hidden md:block">
          <NowPlayingProgress />
        </div>
        <footer className="hidden md:block shrink-0 border-t border-border bg-bg-elevated">
          <Player />
        </footer>
      </main>

      <Toast />
      <AudioPlayer />

      {/* Mobile player drawer */}
      <PlayerDrawer open={playerDrawerOpen} onClose={() => setPlayerDrawerOpen(false)} />
    </div>
  )
}
