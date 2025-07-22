// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync } from 'fs';

// 🔁 Plugin to copy redirects file after build
const copyRedirectsPlugin = () => {
  return {
    name: 'copy-redirects',
    buildEnd() {
      const src = resolve(__dirname, 'public/redirects');
      const dest = resolve(__dirname, 'dist/_redirects');
      try {
        copyFileSync(src, dest);
        console.log('✅ _redirects file copied successfully');
      } catch (err) {
        console.warn('⚠️ Failed to copy _redirects file:', err.message);
      }
    }
  };
};

export default defineConfig({
  base: '/',
  plugins: [react(), copyRedirectsPlugin()],
  define: {
    'process.env': {}
  }
});
