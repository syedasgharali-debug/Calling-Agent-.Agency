
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const isProduction = window.location.hostname === 'www.callingagent.agency' || window.location.hostname === 'callingagent.agency';

if (!isProduction) {
  // Global error handler to suppress persistent environmental/library errors
  window.addEventListener('error', (event) => {
    const msg = event.message || '';
    if (
      msg.includes('Cannot set property fetch') ||
      msg.includes('is not valid JSON') ||
      msg.includes('undefined" is not valid JSON') ||
      msg.includes('getContext') ||
      msg.includes('Script error.')
    ) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  }, true);

  // Suppress unhandled promise rejections for the same errors
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const msg = (reason && (reason.message || reason.toString())) || '';
    if (
      msg.includes('Cannot set property fetch') ||
      msg.includes('is not valid JSON') ||
      msg.includes('undefined" is not valid JSON') ||
      msg.includes('getContext') ||
      msg.includes('Script error.')
    ) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  });

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

  // Robust window.gapi decorator to prevent getContext / context.open errors
  (function interceptGapi() {
    try {
      const prepareGapi = (target: any) => {
        if (!target || typeof target !== 'object') return;
        
        if (!target.iframes) {
          const safeContext = {
            open: function() {
              return {
                register: function() {},
                reposition: function() {},
                close: function() {}
              };
            },
            getActiveIframe: function() { return null; },
            getIframe: function() { return null; }
          };
          target.iframes = {
            getContext: function() {
              return safeContext;
            }
          };
        } else {
          const originalGetContext = target.iframes.getContext;
          target.iframes.getContext = function() {
            let ctx = originalGetContext ? originalGetContext.apply(this, arguments) : null;
            if (!ctx) {
              ctx = {
                open: function() {
                  return {
                    register: function() {},
                    reposition: function() {},
                    close: function() {}
                  };
                },
                getActiveIframe: function() { return null; },
                getIframe: function() { return null; }
              };
            } else if (typeof ctx.open !== 'function') {
              ctx.open = function() {
                return {
                  register: function() {},
                  reposition: function() {},
                  close: function() {}
                };
              };
            }
            return ctx;
          };
        }
      };

      let activeGapi = (window as any).gapi;
      if (activeGapi) {
        prepareGapi(activeGapi);
      }

      Object.defineProperty(window, 'gapi', {
        configurable: true,
        enumerable: true,
        get: () => {
          return activeGapi;
        },
        set: (v) => {
          activeGapi = v;
          if (v && typeof v === 'object') {
            prepareGapi(v);
          }
        }
      });
    } catch (e) {
      console.warn('Unable to define gapi decorator on window:', e);
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
}

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
