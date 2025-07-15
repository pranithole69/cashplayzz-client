// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './', // <-- GOOD for surge or relative deploys
  plugins: [react()],
  define: {
    'process.env': {}  // ✅ FIXES VITE ENV issue in production
  }
});
