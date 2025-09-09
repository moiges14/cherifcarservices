import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['terranga-vtc-logo.png'],
      manifest: {
        name: 'Terranga VTC Services',
        short_name: 'Terranga VTC',
        description: 'Service de transport professionnel avec chauffeur',
        theme_color: '#10B981',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'terranga-vtc-logo.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'terranga-vtc-logo.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'terranga-vtc-logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
  ],
  optimizeDeps: {
    exclude: ['lucide-react']
  }
});