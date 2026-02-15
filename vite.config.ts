import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
    allowedHosts: true,
    watch: {
      usePolling: true,
    },
  },
  // Adding specific cacheDir and optimizing options to resolve EXDEV issues in containers
  cacheDir: '/tmp/.vite',
  optimizeDeps: {
    force: true,
  }
})

