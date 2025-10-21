import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        simple: resolve(__dirname, 'simple.html')
      }
    }
  },
  server: {
    // Força o HMR a recarregar completamente em caso de erro
    hmr: {
      overlay: true
    },
    // Aumenta o timeout para evitar erros 504
    fs: {
      strict: false,
    },
    // Aumenta a memória disponível para o processo
    watch: {
      usePolling: true
    }
  },
  optimizeDeps: {
    // Força a reotimização das dependências em caso de problemas
    force: true
  }
})
