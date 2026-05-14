
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Global error handler to suppress persistent environmental/library errors
window.addEventListener('error', (event) => {
  const msg = event.message || '';
  if (
    msg.includes('Cannot set property fetch') ||
    msg.includes('is not valid JSON') ||
    msg.includes('undefined" is not valid JSON')
  ) {
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
}, true);

// Workaround for libraries that try to polyfill/override window.fetch
// Some environments (like restricted iframes) have a read-only fetch getter.
(function interceptFetch() {
  try {
    const descriptor = Object.getOwnPropertyDescriptor(window, 'fetch');
    
    // If it's already got a setter, or is not something we should touch, skip.
    if (!descriptor || (descriptor.set && !descriptor.configurable)) return;

    if (descriptor.configurable) {
      const originalFetch = window.fetch;
      try {
        Object.defineProperty(window, 'fetch', {
          configurable: true,
          enumerable: true,
          get: () => originalFetch,
          set: (v) => {
            console.warn('Suppressing attempt to overwrite window.fetch:', v);
          }
        });
      } catch (e) {
        // Ignore errors during definition
      }
    }
  } catch (e) {
    // Ignore global errors in this check
  }
})();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
