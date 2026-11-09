import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // CRITICAL for Capacitor Android APK:
  // Ensures all asset URLs resolve relatively (e.g. ./assets/...) inside the Android WebView.
  base: './',
  server: {
    host: true, // Listens on 0.0.0.0 so phone can connect via LAN IP
    port: 5173,
    open: false,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});

