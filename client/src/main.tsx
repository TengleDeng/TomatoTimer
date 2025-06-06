import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { useEffect } from "react";

// Function to set the theme based on user preference or system setting
function setInitialTheme() {
  // Check if theme is stored in localStorage
  const storedTheme = localStorage.getItem("theme");
  
  if (storedTheme === "dark" || 
     (!storedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  });
}

// Apply theme before rendering
setInitialTheme();

// Render the app
createRoot(document.getElementById("root")!).render(<App />);
