import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Vitest settings: run tests in a fake browser page (jsdom)
  test: {
    environment: 'jsdom',
  },
})
