import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async';
import './index.css'
import App from './App.jsx'
import { PlayerProvider } from './context/PlayerContext';
import { BrowserRouter } from 'react-router-dom';

import ErrorBoundary from './components/ErrorBoundary';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <PlayerProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </PlayerProvider>
      </HelmetProvider>
    </ErrorBoundary>
  </StrictMode>,
)
