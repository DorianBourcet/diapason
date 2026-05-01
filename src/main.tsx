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
      ;(window as unknown as Record<string, unknown>).__playerStore = storeModule.usePlayerStore
      ;(window as unknown as Record<string, unknown>).__getAllCachedMetadata =
        storeModule.getAllCachedMetadata
    } catch {
      // ignore in dev if import fails
    }
  })()
}
