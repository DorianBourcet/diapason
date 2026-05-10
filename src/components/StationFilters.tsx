import { useState } from 'react'
import { ChevronDown, ChevronUp, X } from 'lucide-react'
import { usePlayerStore } from '../store/playerStore'

interface StationFiltersProps {
  allGenres: string[]
  allCountries: string[]
}

export function StationFilters({ allGenres, allCountries }: StationFiltersProps) {
  const [expanded, setExpanded] = useState(false)

  const sortOrder = usePlayerStore((s) => s.sortOrder)
  const genreFilters = usePlayerStore((s) => s.genreFilters)
  const countryFilters = usePlayerStore((s) => s.countryFilters)
  const setSortOrder = usePlayerStore((s) => s.setSortOrder)
  const toggleGenreFilter = usePlayerStore((s) => s.toggleGenreFilter)
  const toggleCountryFilter = usePlayerStore((s) => s.toggleCountryFilter)
  const clearFilters = usePlayerStore((s) => s.clearFilters)

  const activeCount = genreFilters.length + countryFilters.length

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setSortOrder(sortOrder === 'az' ? 'za' : 'az')}
          className="h-10 md:h-auto px-1 text-[11px] md:text-[10px] tracking-widest text-text-muted hover:text-text transition-colors shrink-0 cursor-pointer"
        >
          {sortOrder === 'az' ? 'A→Z' : 'Z→A'}
        </button>

        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1 ml-auto h-10 md:h-auto px-1 text-[11px] md:text-[10px] tracking-widest text-text-muted hover:text-text transition-colors cursor-pointer"
        >
          {activeCount > 0 && !expanded && <span className="text-accent">{activeCount}</span>}
          <span>filtres</span>
          {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
        </button>

        {activeCount > 0 && (
          <button
            onClick={clearFilters}
            aria-label="Effacer les filtres"
            className="w-10 h-10 md:w-auto md:h-auto flex items-center justify-center text-text-muted hover:text-text transition-colors cursor-pointer"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {expanded && (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-1.5 md:gap-1">
            {allGenres.map((genre) => {
              const active = genreFilters.includes(genre)
              return (
                <button
                  key={genre}
                  onClick={() => toggleGenreFilter(genre)}
                  className={`text-[11px] md:text-[10px] tracking-widest px-2.5 py-1.5 md:px-1.5 md:py-0.5 rounded border transition-colors cursor-pointer ${
                    active
                      ? 'bg-accent-muted text-accent border-accent/30'
                      : 'bg-bg border-border text-text-muted hover:text-text'
                  }`}
                >
                  {genre}
                </button>
              )
            })}
          </div>

          <div className="flex flex-wrap gap-1.5 md:gap-1">
            {allCountries.map((country) => {
              const active = countryFilters.includes(country)
              return (
                <button
                  key={country}
                  onClick={() => toggleCountryFilter(country)}
                  className={`text-[11px] md:text-[10px] tracking-widest px-2.5 py-1.5 md:px-1.5 md:py-0.5 rounded border transition-colors cursor-pointer ${
                    active
                      ? 'bg-accent-muted text-accent border-accent/30'
                      : 'bg-bg border-border text-text-muted hover:text-text'
                  }`}
                >
                  {country}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
