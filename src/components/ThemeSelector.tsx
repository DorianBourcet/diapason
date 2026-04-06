import { Monitor, Sun, Moon } from 'lucide-react'
import { usePlayerStore } from '../store/playerStore'
import type { Theme } from '../types'

const options: { value: Theme; icon: React.ReactNode; label: string }[] = [
  { value: 'system', icon: <Monitor size={14} />, label: 'Système' },
  { value: 'light', icon: <Sun size={14} />, label: 'Clair' },
  { value: 'dark', icon: <Moon size={14} />, label: 'Sombre' },
]

export function ThemeSelector() {
  const { theme, setTheme } = usePlayerStore()

  return (
    <div className="flex bg-bg rounded-lg p-0.5 gap-0.5 border border-border">
      {options.map((option) => {
        const isActive = theme === option.value
        return (
          <button
            key={option.value}
            onClick={() => setTheme(option.value)}
            aria-pressed={isActive}
            aria-label={option.label}
            title={option.label}
            className={`
              flex-1 flex items-center justify-center py-1.5 rounded-md transition-colors cursor-pointer
              ${isActive
                ? 'bg-bg-elevated text-accent'
                : 'text-text-muted hover:text-text'
              }
            `}
          >
            {option.icon}
          </button>
        )
      })}
    </div>
  )
}
