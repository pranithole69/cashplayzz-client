import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['antd', 'moment']
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/]
    }
  },
  server: {
    fs: {
      allow: ['.']
    }
  }
});
