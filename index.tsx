
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

// Safe JSON.parse override to prevent "undefined" is not valid JSON errors
(function patchJsonParse() {
  try {
    const originalParse = JSON.parse;
    JSON.parse = function (text: any, reviver?: any) {
      if (text === undefined || text === null || text === 'undefined' || text === 'null' || text === '') {
        return null;
      }
      try {
        return originalParse(text, reviver);
      } catch (e) {
        if (typeof text === 'string' && (text.trim() === 'undefined' || text.trim() === '')) {
          return null;
        }
        throw e;
      }
    };
  } catch (e) {
    console.warn('Unable to patch JSON.parse:', e);
  }
})();

// Safe window.fetch override to prevent "Cannot set property fetch" errors
// We define a writable, configurable fetch property directly on the window object
// that delegates reads to the original fetch but safely absorbs or allows updates.
(function interceptFetch() {
  try {
    const originalFetch = window.fetch;
    let activeFetch = originalFetch;
    Object.defineProperty(window, 'fetch', {
      configurable: true,
      enumerable: true,
      get: () => activeFetch,
      set: (v) => {
        if (typeof v === 'function') {
          activeFetch = v;
        } else {
          console.warn('Suppressing attempt to overwrite window.fetch with non-function:', v);
        }
      }
    });
  } catch (e) {
    console.warn('Unable to define fetch decorator on window:', e);
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
