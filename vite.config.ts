import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Prevent Vite from scanning gentelella-master template (contains leaflet/map.html)
  optimizeDeps: {
    entries: ['index.html'],
  },
  server: {
    fs: {
      deny: ['gentelella-master'],
    },
  },
})
