import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // En desarrollo, Vite reenvía /api al backend local (backPawPets, puerto 8081).
    proxy: {
      '/api': 'http://localhost:8081',
    },
  },
})
