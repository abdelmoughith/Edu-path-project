import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/users': {
        target: 'http://localhost:8089',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/users/, '/users'),
      },
      '/api/courses': {
        target: 'http://localhost:8089',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/courses/, '/courses'),
      },
      '/api/activities': {
        target: 'http://localhost:8089',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/activities/, '/activities'),
      },
      '/api/ai': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ai/, ''),
      },
    },
  },
})
