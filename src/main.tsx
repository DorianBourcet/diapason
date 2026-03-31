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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).__playerStore = storeModule.usePlayerStore
      ;(window as any).__getAllCachedMetadata = storeModule.getAllCachedMetadata
    } catch (e) {
      // ignore in dev if import fails
    }
  })()
}
