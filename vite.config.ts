import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

const backend = {
  target: process.env.VITE_API_PROXY_TARGET ?? 'http://localhost:8080',
  changeOrigin: true,
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Every backend endpoint lives under /api.
      '/api': backend,
    },
  },
  // Same proxy for `npm run preview`, which doesn't use `server`.
  preview: {
    proxy: {
      '/api': backend,
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
