import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { Toaster } from './components/ui/sonner';

// Robust routing guard: convert clean pathnames to hash equivalents to prevent router fallback/redirects
const cleanPaths = ['/dashboard', '/acciones', '/participantes', '/certificados', '/login'];
const matchPath = cleanPaths.find(p => window.location.pathname.startsWith(p));
if (matchPath) {
  window.location.replace(`${window.location.origin}/#${window.location.pathname}${window.location.search}`);
} else if (window.location.pathname.startsWith('/v/')) {
  const token = window.location.pathname.substring(3);
  window.location.replace(`${window.location.origin}/#/v/${token}${window.location.search}`);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Toaster />
  </StrictMode>,
);
