export function VinylPlaceholder() {
  return (
    <svg viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Disque */}
      <circle cx="160" cy="160" r="155" className="fill-bg-elevated" />

      {/* Sillons */}
      {[60, 75, 90, 105, 115, 122, 129, 136, 143].map((r) => (
        <circle key={r} cx="160" cy="160" r={r} fill="none" className="stroke-border" strokeWidth="1.5" />
      ))}

      {/* Étiquette centrale */}
      <circle cx="160" cy="160" r="48" className="fill-bg" />
      <circle cx="160" cy="160" r="44" className="fill-bg-elevated" />

      {/* Texte étiquette */}
      <text
        x="160"
        y="153"
        textAnchor="middle"
        fontSize="9"
        letterSpacing="3"
        fontFamily="system-ui"
        className="fill-text-muted"
      >
        DIAPASON
      </text>
      <line x1="130" y1="160" x2="190" y2="160" className="stroke-border" strokeWidth="0.5" />
      <text
        x="160"
        y="172"
        textAnchor="middle"
        fontSize="7"
        letterSpacing="1"
        fontFamily="system-ui"
        className="fill-text-muted"
        opacity="0.6"
      >
        EN COURS
      </text>

      {/* Trou central */}
      <circle cx="160" cy="160" r="5" className="fill-bg" />

      {/* Reflet */}
      <ellipse cx="130" cy="100" rx="30" ry="15" fill="white" opacity="0.02" transform="rotate(-30 130 100)" />
    </svg>
  )
}
