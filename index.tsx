
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Improved workaround for "Cannot set property fetch of #<Window> which has only a getter"
// Some libraries try to polyfill/override fetch, which fails in restricted environments like iframes.
(function interceptFetch() {
  try {
    const descriptor = Object.getOwnPropertyDescriptor(window, 'fetch');
    
    // If it's already settable, we are mostly safe, but some libs still fail with "illegal invocation"
    // if they don't bind properly. 
    if (descriptor && descriptor.configurable) {
      if (!descriptor.set || !descriptor.get) {
        const originalFetch = window.fetch;
        Object.defineProperty(window, 'fetch', {
          configurable: true,
          enumerable: true,
          get: () => originalFetch,
          set: (v) => {
            console.warn('Blocked attempt to overwrite window.fetch with:', v);
            // We just ignore the set attempt to prevent the "only a getter" TypeError
          }
        });
      }
    } else if (descriptor && !descriptor.configurable) {
      console.warn('window.fetch is not configurable. Overwrites might still fail.');
    }
  } catch (e) {
    console.warn('Failed to patch fetch:', e);
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
