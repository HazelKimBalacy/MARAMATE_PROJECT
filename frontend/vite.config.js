import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// The Spring Boot API runs on :8080. Proxying /api keeps the browser on one origin in development.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})
