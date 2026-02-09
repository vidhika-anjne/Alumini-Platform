import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Fix libraries expecting Node's global in browser
  define: {
    global: 'window',
  },
  server: {
    port: 3000,
    open: true
  }
})


