import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    port: 3000,
    strictPort: true,
    host: true,
    proxy: {
      '/api': {
        // Backend dev runs on http://localhost:5000 (PORT=5000)
        // to avoid conflicting with Vite on :3000
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});