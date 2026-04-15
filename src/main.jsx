import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'
import "./i18n/index.js";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 3000,
        style: {
          borderRadius: "12px",
          fontFamily: "inherit",
          fontSize: "14px",
        },
        success: {
          style: {
            background: "#f0fdf4",
            border: "1px solid #bbf7d0",
            color: "#15803d",
          },
          iconTheme: {
            primary: "#22c55e",
            secondary: "#f0fdf4",
          },
        },
        error: {
          style: {
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#b91c1c",
          },
        },
      }}
    />
  </StrictMode>,
)