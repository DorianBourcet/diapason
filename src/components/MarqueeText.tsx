import { useId, useEffect, useRef, useState } from 'react'

interface MarqueeTextProps {
  text: string
  className?: string
  speed?: number // pixels per second
  gap?: number // pixel gap between the two copies
  delay?: number // delay in seconds at each iteration
}

const SCROLL_EASING = 'cubic-bezier(0.10, 0, 0.90, 1)'

interface ScrollState {
  offset: number
  totalDuration: number
  pausePercent: number
}

function computeScrollState(
  textWidth: number,
  containerWidth: number,
  gap: number,
  speed: number,
  delay: number,
): ScrollState | null {
  if (textWidth <= containerWidth) return null

  const offset = textWidth + gap
  const scrollDuration = offset / speed
  const totalDuration = scrollDuration + delay
  const pausePercent = (delay / totalDuration) * 100

  return { offset, totalDuration, pausePercent }
}

export function MarqueeText({
  text,
  className = '',
  speed = 40,
  gap = 64,
  delay = 3,
}: MarqueeTextProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const id = useId()
  const animNameRef = useRef(`marquee-${id.replace(/:/g, '')}`)
  const styleElRef = useRef<HTMLStyleElement | null>(null)
  const [scrollState, setScrollState] = useState<ScrollState | null>(null)

  // Observe container size changes and recompute the scroll animation accordingly.
  // Uses ResizeObserver to ensure layout is fully computed before measuring.
  useEffect(() => {
    const container = containerRef.current
    const textEl = textRef.current
    if (!container || !textEl) return

    function measure() {
      const textEl = textRef.current
      const container = containerRef.current
      if (!textEl || !container) return

      const textWidth = textEl.getBoundingClientRect().width
      const containerWidth = container.getBoundingClientRect().width
      const state = computeScrollState(textWidth, containerWidth, gap, speed, delay)

      if (state) {
        if (!styleElRef.current) {
          const style = document.createElement('style')
          document.head.appendChild(style)
          styleElRef.current = style
        }
        styleElRef.current.textContent = `
          @keyframes ${animNameRef.current} {
            0%                     { transform: translateX(0); }
            ${state.pausePercent}% { transform: translateX(0); animation-timing-function: ${SCROLL_EASING}; }
            100%                   { transform: translateX(-${state.offset}px); }
          }
        `
      } else {
        styleElRef.current?.remove()
        styleElRef.current = null
      }

      setScrollState(state)
    }

    const observer = new ResizeObserver(measure)
    observer.observe(container)

    return () => observer.disconnect()
  }, [text, speed, gap, delay])

  // Remove the injected <style> element from the <head> when the component unmounts.
  useEffect(() => {
    return () => {
      styleElRef.current?.remove()
    }
  }, [])

  return (
    <div ref={containerRef} className={`overflow-hidden whitespace-nowrap ${className}`}>
      {scrollState ? (
        <span
          className="inline-flex"
          style={{
            gap: `${gap}px`,
            animation: `${animNameRef.current} ${scrollState.totalDuration}s linear infinite`,
          }}
        >
          <span ref={textRef}>{text}</span>
          <span aria-hidden="true">{text}</span>
        </span>
      ) : (
        <span ref={textRef}>{text}</span>
      )}
    </div>
  )
}
