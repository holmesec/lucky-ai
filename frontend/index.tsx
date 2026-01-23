
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ThemeProvider } from './themes/ThemeProvider.tsx';

const mount = () => {
  const container = document.getElementById('root');

  if (!container) {
    console.error("Oracle v3.0 Error: Target container #root was not found in the document.");
    return;
  }

  try {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </React.StrictMode>
    );
  } catch (err) {
    console.error("Oracle v3.0: Fatal render exception:", err);
    container.innerHTML = `
      <div style="background:#020617;color:#f87171;padding:40px;font-family:monospace;height:100vh;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;">
        <h1 style="font-size:1.5rem;margin-bottom:20px;">MOUNTING FAILED</h1>
        <pre style="background:#000;padding:20px;border:1px solid #ef4444;border-radius:8px;max-width:90%;overflow:auto;">${err instanceof Error ? err.message : String(err)}</pre>
      </div>
    `;
  }
};

// Check readyState for immediate mount if DOM is already parsed
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  mount();
} else {
  document.addEventListener('DOMContentLoaded', mount);
}
