import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/app.scss';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Register Service Worker for PWA / offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const { registerSW } = await import('virtual:pwa-register');
      registerSW({
        onNeedRefresh(registration) {
          // Notify App component via custom message
          window.postMessage({ type: 'SW_UPDATE_AVAILABLE', registration }, '*');
        },
        onOfflineReady() {
          window.postMessage({ type: 'SW_OFFLINE_READY' }, '*');
        },
      });
    } catch {
      // vite-plugin-pwa not active in dev mode — silently ignore
    }
  });
}
