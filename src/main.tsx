import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Gracefully handle Vite dev HMR websocket notices in cloud preview environment
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reasonStr = String(event.reason || '');
    if (
      reasonStr.includes('WebSocket') ||
      reasonStr.includes('vite') ||
      reasonStr.includes('createWebSocketModuleRunnerTransport')
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });
}

createRoot(document.getElementById('root')!).render(<App />);
