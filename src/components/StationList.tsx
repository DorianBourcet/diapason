import { stations } from '../data/stations'
import { usePlayerStore } from '../store/playerStore'

interface StationListProps {
  onSelect?: () => void
}

export function StationList({ onSelect }: StationListProps) {
  const { currentStation, selectStation } = usePlayerStore()

  function handleSelect(stationId: string) {
    const station = stations.find((s) => s.id === stationId)
    if (!station) return
    selectStation(station)
    onSelect?.()
  }

  return (
    <ul className="flex flex-col gap-1">
      {stations.map((station) => {
        const isActive = currentStation?.id === station.id
        return (
          <li key={station.id}>
            <button
              onClick={() => handleSelect(station.id)}
              aria-pressed={isActive}
              className={`
                w-full text-left px-3 py-2.5 rounded-md text-sm transition-colors cursor-pointer
                relative flex items-center gap-3
                ${isActive ? 'text-text' : 'text-text-muted hover:text-text hover:bg-accent-muted'}
              `}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent rounded-full" />
              )}
              {station.name}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
