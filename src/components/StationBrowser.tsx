import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useStationBrowser } from '../hooks/useStationBrowser'
import { usePlayerStore } from '../store/playerStore'
import { StationSearch } from './StationSearch'
import { StationFilters } from './StationFilters'
import { StationList } from './StationList'

interface StationBrowserProps {
  onSelect?: () => void
}

export function StationBrowser({ onSelect }: StationBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const favorites = usePlayerStore((s) => s.favorites)
  const favoritesCollapsed = usePlayerStore((s) => s.favoritesCollapsed)
  const stationsCollapsed = usePlayerStore((s) => s.stationsCollapsed)
  const toggleFavorite = usePlayerStore((s) => s.toggleFavorite)
  const setFavoritesCollapsed = usePlayerStore((s) => s.setFavoritesCollapsed)
  const setStationsCollapsed = usePlayerStore((s) => s.setStationsCollapsed)

  const { favoriteStations, otherStations, totalCount, allGenres, allCountries } =
    useStationBrowser(searchQuery)

  const nonFavoriteTotal = totalCount - favorites.length

  return (
    <div className="flex flex-col gap-3 h-full">
      <StationSearch value={searchQuery} onChange={setSearchQuery} />
      <StationFilters allGenres={allGenres} allCountries={allCountries} />

      <div className="overflow-y-auto min-h-0 flex-1 flex flex-col gap-1 -mx-1 px-1 pb-24 md:pb-0">
        {favorites.length > 0 && (
          <div>
            <button
              onClick={() => setFavoritesCollapsed(!favoritesCollapsed)}
              className="flex items-center gap-1 w-full px-2 py-3 md:py-1.5 text-[11px] md:text-[10px] tracking-[0.2em] text-text-muted hover:text-text transition-colors cursor-pointer"
            >
              {favoritesCollapsed ? <ChevronRight size={11} /> : <ChevronDown size={11} />}
              STATIONS FAVORITES ({favoriteStations.length})
            </button>
            {!favoritesCollapsed && (
              <StationList
                stations={favoriteStations}
                favoriteIds={favorites}
                onToggleFavorite={toggleFavorite}
                onSelect={onSelect}
              />
            )}
          </div>
        )}

        {favorites.length > 0 && <div className="border-t border-border mx-2" />}

        <div>
          <button
            onClick={() => setStationsCollapsed(!stationsCollapsed)}
            className="flex items-center gap-1 w-full px-2 py-3 md:py-1.5 text-[11px] md:text-[10px] tracking-[0.2em] text-text-muted hover:text-text transition-colors cursor-pointer"
          >
            {stationsCollapsed ? <ChevronRight size={11} /> : <ChevronDown size={11} />}
            {favorites.length > 0 ? 'AUTRES STATIONS' : 'STATIONS'} (
            {otherStations.length === nonFavoriteTotal
              ? nonFavoriteTotal
              : `${otherStations.length} / ${nonFavoriteTotal}`}
            )
          </button>
          {!stationsCollapsed && otherStations.length > 0 && (
            <StationList
              stations={otherStations}
              favoriteIds={favorites}
              onToggleFavorite={toggleFavorite}
              onSelect={onSelect}
            />
          )}
        </div>
      </div>
    </div>
  )
}
