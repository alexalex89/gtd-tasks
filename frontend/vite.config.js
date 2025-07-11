import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: parseInt(process.env.PORT) || 3000,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://gtd-backend:3742',
        changeOrigin: true,
        secure: false
      }
    }
  },
  preview: {
    port: parseInt(process.env.PORT) || 3000,
    host: '0.0.0.0',
    strictPort: true
  }
})