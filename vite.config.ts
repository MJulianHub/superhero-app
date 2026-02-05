import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      /**
       * SuperheroAPI NO expone CORS para el navegador.
       * Proxy de dev: el frontend llama a `/api/...` y Vite lo reenvía a superheroapi.com.
       */
      '/api': {
        target: 'https://superheroapi.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
