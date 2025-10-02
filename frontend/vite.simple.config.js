import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuração simplificada para debug
export default defineConfig({
  plugins: [react()],
  server: {
    open: '/simple.html'
  },
  build: {
    rollupOptions: {
      input: {
        simple: 'simple.html'
      }
    }
  }
})