import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/users': { target: 'http://api-gateway:8089', rewrite: path => path.replace(/^\/api\/users/, '/users') },
      '/api/courses': { target: 'http://api-gateway:8089', rewrite: path => path.replace(/^\/api\/courses/, '/courses') },
      '/api/activities': { target: 'http://api-gateway:8089', rewrite: path => path.replace(/^\/api/activities/, '/activities') },
      '/api/ai': { target: 'http://edupath-ml:8000', rewrite: path => path.replace(/^\/api\/ai/, ''), changeOrigin: true },
    },
  },
})
