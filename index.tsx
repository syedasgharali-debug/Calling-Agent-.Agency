
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Improved workaround for "Cannot set property fetch of #<Window> which has only a getter"
// Some libraries try to polyfill/override fetch, which fails in restricted environments like iframes.
(function interceptFetch() {
  try {
    const descriptor = Object.getOwnPropertyDescriptor(window, 'fetch');
    
    // If we can reconfigure it, let's make it have a setter that just logs/ignores 
    // to prevent libraries from crashing when they try to proxy/polyfill it.
    if (descriptor && descriptor.configurable) {
      const originalFetch = window.fetch;
      try {
        Object.defineProperty(window, 'fetch', {
          configurable: true,
          enumerable: true,
          get: () => originalFetch,
          set: (v) => {
            console.warn('Blocked attempt to overwrite window.fetch. Libraries often try this for analytics or proxying.', v);
            // We ignore to prevent "only a getter" TypeError
          }
        });
      } catch (innerError) {
        console.error('Inner fetch patch failed:', innerError);
      }
    } else if (descriptor && !descriptor.configurable) {
      // If it's already only a getter and non-configurable, we can't do much.
      // But we can try to at least warn.
      if (!descriptor.writable && !descriptor.set) {
        console.warn('window.fetch is read-only and non-configurable. Libraries trying to polyfill it will crash.');
      }
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
