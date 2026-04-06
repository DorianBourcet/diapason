import { useEffect, useState } from 'react'
import { useNowPlaying } from './hooks/useNowPlaying'
import { StationList } from './components/StationList'
import { ThemeSelector } from './components/ThemeSelector'
import { Player } from './components/Player'
import { NowPlaying, NowPlayingProgress } from './components/NowPlaying'
import { usePlayerStore } from './store/playerStore'

export default function App() {
  useNowPlaying()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const theme = usePlayerStore((s) => s.theme)

  useEffect(() => {
    const root = document.documentElement
    const mq = window.matchMedia('(prefers-color-scheme: dark)')

    const apply = () => {
      const resolved = theme === 'system' ? (mq.matches ? 'dark' : 'light') : theme
      root.classList.remove('light', 'dark')
      root.classList.add(resolved)
    }

    apply()

    if (theme === 'system') {
      mq.addEventListener('change', apply)
      return () => mq.removeEventListener('change', apply)
    }
  }, [theme])

  return (
    <div className="flex h-dvh overflow-hidden bg-bg text-text">
      {/* Sidebar — desktop only */}
      <aside className="hidden md:flex w-48 shrink-0 flex-col pt-10 px-4 gap-8 min-h-0 border-r border-border">
        <span className="text-xs tracking-[0.3em] font-light px-2 mt-6 mb-4 shrink-0 text-text">
          DIAPASON
        </span>
        <div className="overflow-y-auto min-h-0 pb-4 flex-1">
          <StationList />
        </div>
        <div className="shrink-0 pb-6 pt-4 border-border">
          <ThemeSelector />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between px-5 h-12 shrink-0 border-b border-border">
          <span className="text-xs tracking-[0.3em] font-light text-text">DIAPASON</span>
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Ouvrir la liste des stations"
            className="flex flex-col gap-1 p-2 -mr-2"
          >
            <span className="w-4 h-px bg-text-muted" />
            <span className="w-4 h-px bg-text-muted" />
            <span className="w-4 h-px bg-text-muted" />
          </button>
        </header>

        <div className="flex-1 flex items-center justify-center overflow-hidden min-h-0">
          <NowPlaying />
        </div>
        <NowPlayingProgress />
        <footer className="shrink-0 border-t border-border bg-bg-elevated">
          <Player />
        </footer>
      </main>

      {/* Mobile drawer — stations */}
      <>
        {/* Backdrop */}
        <div
          className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 md:hidden ${
            drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
        />

        {/* Sheet */}
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Stations"
          className={`fixed inset-x-0 bottom-0 z-50 bg-bg-elevated rounded-t-2xl border-t border-border transition-transform duration-300 ease-out md:hidden max-h-[70dvh] flex flex-col ${
            drawerOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1 shrink-0">
            <div className="w-8 h-0.5 rounded-full bg-text-muted opacity-40" />
          </div>

          <div className="px-6 pt-4 pb-2 shrink-0">
            <span className="text-xs tracking-[0.3em] font-light text-text-muted">STATIONS</span>
          </div>

          <div className="px-3 pb-4 overflow-y-auto">
            <StationList onSelect={() => setDrawerOpen(false)} />
          </div>

          <div className="px-3 pb-8 mx-3 pt-4 border-border shrink-0">
            <ThemeSelector />
          </div>
        </div>
      </>
    </div>
  )
}
