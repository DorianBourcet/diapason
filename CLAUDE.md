# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start Vite dev server (with proxy middleware for CORS)
npm run build        # Type-check (tsc -b) then bundle with Vite
npm run lint         # ESLint on /src
npm run lint:fix     # ESLint with auto-fix
npm run format       # Prettier on all source files
npm run test:e2e     # Playwright end-to-end tests
npm run preview      # Preview production build locally
npm run deploy       # Build and deploy to GitHub Pages
```

## Architecture

**Diapason** is a web radio player (React + TypeScript + Vite) deployed on GitHub Pages. It streams audio from various radio stations and displays live "Now Playing" metadata by polling each station's API.

### Data Flow

```
StationList (UI) → playerStore (Zustand) → useNowPlaying (hook) → Adapter → Proxy → Station API
                                        ↓
                             AudioPlayer (hidden <audio> element)
```

### Key Layers

**`/src/store/playerStore.ts`** — Central Zustand store. Holds `currentStation`, `currentTrack`, `status` (`'playing' | 'paused' | 'stopped' | 'loading'`), `volume`, `theme`, `muted`. Persists `currentStation`, `volume`, and `theme` to localStorage. Contains an in-memory metadata cache (Map keyed by station ID) to avoid redundant API calls.

**`/src/hooks/useNowPlaying.ts`** — Polls the active station's adapter on a schedule (30–60 s, adaptive to track duration). Preloads cover images to prevent layout flash. Writes results into the store's `currentTrack`.

**`/src/adapters/`** — One file per station. Each exports `fetchMetadata(station: Station): Promise<TrackMetadata>`. All use the `proxyUrl()` utility to route through the CORS proxy. When adding a new station that needs metadata, create a new adapter file here and register the adapter name in `Station.adapter`.

**`/src/utils/proxyUrl.ts`** — Routes API calls through:
- **Dev**: Vite middleware at `/proxy/<hostname><path>`
- **Prod**: Cloudflare Worker at `https://diapason-proxy.dorianbourcet.workers.dev/`

The Vite proxy middleware is defined inline in `vite.config.ts` and forwards requests over HTTPS to avoid CORS restrictions during development.

**`/src/data/`** — Static station list. Add new stations here with `id`, `name`, `streamUrl`, and optionally `adapter` + `adapterConfig`.

**`/src/components/AudioPlayer.tsx`** — Hidden `<audio>` element. Syncs stream URL on station change, handles Media Session API for native device controls (play/pause on headphones/OS).

### Types

```typescript
interface Station {
  id: string
  name: string
  streamUrl: string
  adapter?: 'radiofrance' | 'tsfjazz' | 'grrif' | 'kcrw-eclectic24' | 'kexp' | '247-lofi-radio'
  adapterConfig?: Record<string, string>
}

interface TrackMetadata {
  title?: string; artist?: string; album?: string; coverUrl?: string
  startedAt?: number  // Unix timestamp
  duration?: number   // Seconds
}
```

### Style Conventions

- No semicolons, single quotes, 2-space indent, 100-char line width (Prettier enforces this)
- Prefix unused variables with `_` to satisfy ESLint
- `console.error` / `console.warn` are allowed; bare `console.log` triggers a lint warning
- Tailwind CSS 4 with custom CSS variables for theming (warm/beige light mode, dark brown dark mode, accent `#9e4e22` / `#c97a5e`)

### Deployment

The app is deployed to GitHub Pages under the `/diapason/` subpath (set as `base` in `vite.config.ts`). The Cloudflare Worker handles CORS proxying in production.
