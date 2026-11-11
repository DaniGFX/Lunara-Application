import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Ensures Android APKs are served with correct MIME type and filename so browsers don't rename to .zip
const apkMimePlugin = () => ({
  name: 'apk-mime-type',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url && (req.url.endsWith('.apk') || req.url.includes('.apk?'))) {
        res.setHeader('Content-Type', 'application/vnd.android.package-archive');
        res.setHeader('Content-Disposition', 'attachment; filename="LUNARA.apk"');
      }
      next();
    });
  },
  configurePreviewServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url && (req.url.endsWith('.apk') || req.url.includes('.apk?'))) {
        res.setHeader('Content-Type', 'application/vnd.android.package-archive');
        res.setHeader('Content-Disposition', 'attachment; filename="LUNARA.apk"');
      }
      next();
    });
  },
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    apkMimePlugin(),
  ],
  // CRITICAL for Capacitor Android APK:
  // Ensures all asset URLs resolve relatively (e.g. ./assets/...) inside the Android WebView.
  base: './',
  server: {
    host: true, // Listens on 0.0.0.0 so phone can connect via LAN IP
    port: 5173,
    open: false,
    watch: {
      ignored: ['**/android/**', '**/dist/**', '**/*.apk', '**/public/*.apk'],
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});

