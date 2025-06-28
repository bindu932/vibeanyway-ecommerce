// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // ✅ Set your backend server URL
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
