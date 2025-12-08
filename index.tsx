import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ThemeProvider } from './context/ThemeContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

try {
  root.render(
    <React.StrictMode>
      <ThemeProvider>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </ThemeProvider>
    </React.StrictMode>
  );

  // Debug: confirm that the client script executed
  console.log('[dev] React app mounted to #root');
} catch (err: any) {
  // If rendering fails during module initialization, show a visible error box instead of a white screen
  console.error('Fatal render error during bootstrap:', err);
  try {
    const el = document.createElement('div');
    el.style.cssText = 'font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial; padding:24px;';
    el.innerHTML = `<h2 style="color:#b91c1c">Application failed to load</h2><pre style="white-space:pre-wrap;color:#111">${(err && err.message) || String(err)}</pre><p style="color:#374151">Check developer console for stack trace.</p>`;
    document.body.innerHTML = '';
    document.body.appendChild(el);
  } catch (e) {
    // ignore secondary errors
  }
}

// Global error handlers so we can catch unexpected exceptions that would otherwise cause a white screen
window.addEventListener('error', (ev) => {
  console.error('Global error', ev.error || ev.message, ev);
});

window.addEventListener('unhandledrejection', (ev) => {
  console.error('Unhandled promise rejection', ev.reason);
});