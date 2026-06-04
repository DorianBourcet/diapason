import { useEffect, useMemo, useRef, useState } from 'react'

interface StationNameCoverProps {
  name: string
}

const MEASURE_FONT = '700 100px system-ui, sans-serif'
const LINE_HEIGHT = 0.92
const PADDING_RATIO = 0.07

export function StationNameCover({ name }: StationNameCoverProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new ResizeObserver(() => {
      const rect = container.getBoundingClientRect()
      setSize({ width: rect.width, height: rect.height })
    })
    observer.observe(container)

    return () => observer.disconnect()
  }, [])

  const words = useMemo(() => name.toUpperCase().split(/\s+/).filter(Boolean), [name])

  // One random target width fraction in [0.5, 1.0] per word. Drawn once per station name
  // (independent of size), so resizing the window doesn't reshuffle the cover.
  const fractions = useMemo(() => words.map(() => 0.5 + Math.random() * 0.5), [words])

  const lines = useMemo(() => {
    if (size.width === 0 || words.length === 0) return []

    if (!canvasRef.current) canvasRef.current = document.createElement('canvas')
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return []
    ctx.font = MEASURE_FONT

    const innerWidth = size.width * (1 - 2 * PADDING_RATIO)
    const innerHeight = size.height * (1 - 2 * PADDING_RATIO)

    // font-size so the rendered word width equals its target fraction of the inner width.
    const fontSizes = words.map((word, i) => {
      const unitWidth = ctx.measureText(word).width / 100
      return (fractions[i] * innerWidth) / unitWidth
    })

    // Scale everything down if the stack is taller than the box.
    const totalHeight = fontSizes.reduce((sum, fs) => sum + fs * LINE_HEIGHT, 0)
    const scale = totalHeight > innerHeight ? innerHeight / totalHeight : 1

    return words.map((word, i) => ({ word, fontSize: fontSizes[i] * scale }))
  }, [words, fractions, size])

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-end justify-center w-full h-full overflow-hidden bg-bg-elevated"
      style={{ padding: `${PADDING_RATIO * 100}%` }}
      aria-label={name}
    >
      {lines.map(({ word, fontSize }, i) => (
        <span
          key={`${word}-${i}`}
          className="font-bold uppercase text-accent whitespace-nowrap"
          style={{ fontSize: `${fontSize}px`, lineHeight: LINE_HEIGHT }}
        >
          {word}
        </span>
      ))}
    </div>
  )
}
