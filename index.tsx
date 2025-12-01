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

// Global error handlers so we can catch unexpected exceptions that would otherwise cause a white screen
window.addEventListener('error', (ev) => {
  console.error('Global error', ev.error || ev.message, ev);
});

window.addEventListener('unhandledrejection', (ev) => {
  console.error('Unhandled promise rejection', ev.reason);
});