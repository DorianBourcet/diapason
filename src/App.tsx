import { useState } from 'react'
import { useNowPlaying } from './hooks/useNowPlaying'
import { StationList } from './components/StationList'
import { Player } from './components/Player'
import { NowPlaying, NowPlayingProgress } from './components/NowPlaying'

export default function App() {
  useNowPlaying()
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="flex h-dvh bg-[#0a0a0a] text-white overflow-hidden">
      {/* Sidebar — desktop only */}
      <aside className="hidden md:flex w-48 shrink-0 border-r border-white/5 flex-col pt-10 px-4 gap-8 min-h-0">
        <span className="text-xs tracking-[0.3em] text-white/90 font-light px-2 mt-6 mb-4 shrink-0">
          DIAPASON
        </span>
        <div className="overflow-y-auto min-h-0 pb-4">
          <StationList />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between px-5 h-12 border-b border-white/5 shrink-0">
          <span className="text-xs tracking-[0.3em] text-white/90 font-light">DIAPASON</span>
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Ouvrir la liste des stations"
            className="flex flex-col gap-1 p-2 -mr-2"
          >
            <span className="w-4 h-px bg-white/40" />
            <span className="w-4 h-px bg-white/40" />
            <span className="w-4 h-px bg-white/40" />
          </button>
        </header>

        <div className="flex-1 flex items-center justify-center overflow-hidden min-h-0">
          <NowPlaying />
        </div>
        <NowPlayingProgress />
        <footer className="border-t border-white/5 bg-[#0d0d0d] shrink-0">
          <Player />
        </footer>
      </main>

      {/* Mobile drawer — stations */}
      <>
        {/* Backdrop */}
        <div
          className={`fixed inset-0 z-40 bg-black/60 transition-opacity duration-300 md:hidden ${
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
          className={`fixed inset-x-0 bottom-0 z-50 bg-[#111] rounded-t-2xl border-t border-white/5 transition-transform duration-300 ease-out md:hidden ${
            drawerOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-8 h-0.5 bg-white/20 rounded-full" />
          </div>

          <div className="px-6 pt-4 pb-2">
            <span className="text-xs tracking-[0.3em] text-white/40 font-light">STATIONS</span>
          </div>

          <div className="px-3 pb-8">
            <StationList onSelect={() => setDrawerOpen(false)} />
          </div>
        </div>
      </>
    </div>
  )
}
