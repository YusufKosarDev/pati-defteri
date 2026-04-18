import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import './index.css'
import './i18n/index.js'
import App from './App.jsx'
import ErrorBoundary from './components/UI/ErrorBoundary.jsx'

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "12px",
            fontFamily: "inherit",
            fontSize: "14px",
            background: "#1f2937",
            color: "#f3f4f6",
            border: "1px solid #374151",
          },
          success: {
            style: {
              background: "#064e3b",
              border: "1px solid #065f46",
              color: "#6ee7b7",
            },
            iconTheme: {
              primary: "#10b981",
              secondary: "#064e3b",
            },
          },
          error: {
            style: {
              background: "#450a0a",
              border: "1px solid #7f1d1d",
              color: "#fca5a5",
            },
          },
        }}
      />
    </ErrorBoundary>
  </StrictMode>,
)