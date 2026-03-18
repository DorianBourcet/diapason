import { useAudio } from './hooks/useAudio'
import { useNowPlaying } from './hooks/useNowPlaying'
import { StationList } from './components/StationList'
import { Player } from './components/Player'
import { NowPlaying, NowPlayingProgress } from './components/NowPlaying'

export default function App() {
  useAudio()
  useNowPlaying()

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white overflow-hidden">
      <aside className="w-48 shrink-0 border-r border-white/5 flex flex-col pt-10 px-4 gap-8">
        <span className="text-xs tracking-[0.3em] text-white/90 font-light px-2 mt-6 mb-4">
          DIAPASON
        </span>
        <StationList />
      </aside>

      <main className="flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <NowPlaying />
        </div>
        <NowPlayingProgress />
        <footer className="border-t border-white/5 bg-[#0d0d0d]">
          <Player />
        </footer>
      </main>
    </div>
  )
}
