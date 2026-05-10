import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Expose store/debug helpers to window during development for manual testing
if (import.meta.env.DEV) {
  ;(async () => {
    try {
      const storeModule = await import('./store/playerStore')
      const { metadataCache } = await import('./utils/metadataCache')
      ;(window as unknown as Record<string, unknown>).__playerStore = storeModule.usePlayerStore
      ;(window as unknown as Record<string, unknown>).__getAllCachedMetadata = () =>
        metadataCache.snapshot()
    } catch {
      // ignore in dev if import fails
    }
  })()
}
