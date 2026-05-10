import { Search } from 'lucide-react'

interface StationSearchProps {
  value: string
  onChange: (v: string) => void
}

export function StationSearch({ value, onChange }: StationSearchProps) {
  return (
    <div className="relative">
      <Search
        size={12}
        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Rechercher une station"
        className="w-full bg-bg-elevated border border-border rounded-md pl-7 pr-3 py-2.5 md:py-1.5 text-base md:text-xs text-text placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
      />
    </div>
  )
}
