import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo 14.png'],
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
            src: 'logo 14.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logo 14.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'logo 14.png',
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