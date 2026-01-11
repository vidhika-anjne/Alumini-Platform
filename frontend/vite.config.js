import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Fix libraries expecting Node's global in browser
  define: {
    global: 'window',
  },
  server: {
    port: 3000,
    open: true
  }
})