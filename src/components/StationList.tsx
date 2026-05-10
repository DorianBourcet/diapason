import { Heart } from 'lucide-react'
import { usePlayerStore } from '../store/playerStore'
import type { Station } from '../types'

interface StationListProps {
  stations: Station[]
  favoriteIds: string[]
  onToggleFavorite: (id: string) => void
  onSelect?: () => void
}

export function StationList({
  stations,
  favoriteIds,
  onToggleFavorite,
  onSelect,
}: StationListProps) {
  const { currentStation, selectStation } = usePlayerStore()

  function handleSelect(station: Station) {
    selectStation(station)
    onSelect?.()
  }

  if (stations.length === 0) {
    return <p className="text-[10px] tracking-widest text-text-muted px-3 py-4">aucune station</p>
  }

  return (
    <ul className="flex flex-col gap-0.5">
      {stations.map((station) => {
        const isActive = currentStation?.id === station.id
        const isFavorite = favoriteIds.includes(station.id)

        return (
          <li key={station.id} className="group">
            <div
              className={`
                flex items-center gap-2 w-full px-3 py-3 md:py-2.5 rounded-md text-sm transition-colors relative
                ${isActive ? 'text-text' : 'text-text-muted hover:text-text hover:bg-accent-muted'}
              `}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent rounded-full" />
              )}

              <button
                onClick={() => handleSelect(station)}
                aria-pressed={isActive}
                className="flex-1 min-w-0 text-left cursor-pointer"
              >
                {station.name}
              </button>

              <div className="shrink-0 flex items-center gap-0.5">
                <span className="text-[10px] tracking-widest text-text-muted bg-bg-elevated border border-border rounded px-1 py-px">
                  {station.country}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleFavorite(station.id)
                  }}
                  aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                  className={`py-3 px-2 -my-3 md:p-0 md:my-0 transition-colors focus:opacity-100 cursor-pointer ${
                    isFavorite
                      ? 'text-accent'
                      : 'text-text-muted hover:text-accent md:opacity-0 md:group-hover:opacity-100'
                  }`}
                >
                  <Heart size={13} fill={isFavorite ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
