import { useState, useEffect, useRef } from 'react'
import { Sun, Moon, Monitor } from 'lucide-react'
import { usePlayerStore } from '../store/playerStore'
import type { Theme } from '../types'

const themes: { value: Theme; Icon: typeof Sun }[] = [
  { value: 'system', Icon: Monitor },
  { value: 'light', Icon: Sun },
  { value: 'dark', Icon: Moon },
]

export function ThemeSelector() {
  const [expanded, setExpanded] = useState(false)
  const theme = usePlayerStore((s) => s.theme)
  const setTheme = usePlayerStore((s) => s.setTheme)
  const containerRef = useRef<HTMLDivElement>(null)

  const CurrentIcon = themes.find((t) => t.value === theme)?.Icon ?? Monitor

  function handleSelect(value: Theme) {
    setTheme(value)
    setExpanded(false)
  }

  useEffect(() => {
    if (!expanded) return
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setExpanded(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [expanded])

  return (
    <div ref={containerRef} className="flex items-center">
      <div
        style={{ maxWidth: expanded ? '88px' : '0px', opacity: expanded ? 1 : 0 }}
        className="flex items-center overflow-hidden transition-[max-width,opacity] duration-200 ease-out"
      >
        {themes
          .filter(({ value }) => value !== theme)
          .map(({ value, Icon }) => (
            <button
              key={value}
              onClick={() => handleSelect(value)}
              aria-label={value}
              className="p-3 rounded cursor-pointer transition-colors text-text-muted hover:text-text"
            >
              <Icon size={14} />
            </button>
          ))}
      </div>

      <button
        onClick={() => setExpanded((v) => !v)}
        aria-label="Changer le thème"
        className={`p-3 -mr-3 rounded cursor-pointer transition-colors ${
          expanded ? 'text-accent' : 'text-text-muted hover:text-text'
        }`}
      >
        <CurrentIcon size={14} />
      </button>
    </div>
  )
}
