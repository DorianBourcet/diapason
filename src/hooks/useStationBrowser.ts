import { useMemo } from 'react'
import { stations } from '../data/stations'
import { usePlayerStore } from '../store/playerStore'
import type { Station } from '../types'

export interface StationBrowserResult {
  favoriteStations: Station[]
  otherStations: Station[]
  totalCount: number
  allGenres: string[]
  allCountries: string[]
}

export function useStationBrowser(searchQuery: string): StationBrowserResult {
  const favorites = usePlayerStore((s) => s.favorites)
  const sortOrder = usePlayerStore((s) => s.sortOrder)
  const genreFilters = usePlayerStore((s) => s.genreFilters)
  const countryFilters = usePlayerStore((s) => s.countryFilters)

  return useMemo(() => {
    const allGenres = Array.from(new Set(stations.flatMap((s) => s.genres))).sort()
    const allCountries = Array.from(new Set(stations.map((s) => s.country))).sort()

    const q = searchQuery.trim().toLowerCase()

    const matches = (station: Station): boolean => {
      if (q && !station.name.toLowerCase().includes(q)) return false
      if (genreFilters.length > 0 && !station.genres.some((g) => genreFilters.includes(g)))
        return false
      if (countryFilters.length > 0 && !countryFilters.includes(station.country)) return false
      return true
    }

    const compare = (a: Station, b: Station) =>
      sortOrder === 'az' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)

    const filtered = stations.filter(matches).sort(compare)

    const favoriteStations = filtered.filter((s) => favorites.includes(s.id))
    const otherStations = filtered.filter((s) => !favorites.includes(s.id))

    return { favoriteStations, otherStations, totalCount: stations.length, allGenres, allCountries }
  }, [searchQuery, favorites, sortOrder, genreFilters, countryFilters])
}
