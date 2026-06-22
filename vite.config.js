import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',
    allowedHosts: ['5173-i1dh2hhzwexd12of8a2a5-f80ea715.sg1.manus.computer', '5173-itmdg4azgop65lve32eu8-9ff3e630.sg1.manus.computer'],
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path
      }
    }
  }
})
