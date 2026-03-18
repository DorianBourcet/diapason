export function VinylPlaceholder() {
  return (
    <svg viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Disque */}
      <circle cx="160" cy="160" r="155" fill="#1a1a1a" />

      {/* Sillons */}
      {[60, 75, 90, 105, 115, 122, 129, 136, 143].map((r) => (
        <circle key={r} cx="160" cy="160" r={r} fill="none" stroke="#2a2a2a" strokeWidth="1" />
      ))}

      {/* Étiquette centrale */}
      <circle cx="160" cy="160" r="48" fill="#222222" />
      <circle cx="160" cy="160" r="44" fill="#1e1e1e" />

      {/* Texte étiquette */}
      <text
        x="160"
        y="153"
        textAnchor="middle"
        fontSize="9"
        letterSpacing="3"
        fill="#444444"
        fontFamily="system-ui"
      >
        DIAPASON
      </text>
      <line x1="130" y1="160" x2="190" y2="160" stroke="#333333" strokeWidth="0.5" />
      <text
        x="160"
        y="172"
        textAnchor="middle"
        fontSize="7"
        letterSpacing="1"
        fill="#333333"
        fontFamily="system-ui"
      >
        EN COURS
      </text>

      {/* Trou central */}
      <circle cx="160" cy="160" r="5" fill="#0a0a0a" />

      {/* Reflet */}
      <ellipse
        cx="130"
        cy="100"
        rx="30"
        ry="15"
        fill="white"
        opacity="0.02"
        transform="rotate(-30 130 100)"
      />
    </svg>
  )
}
