import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Note: We avoid aggressive 'define' here to prevent clobbering 
  // platform-injected process.env variables.
  server: {
    port: 3000,
    open: false,
    host: true
  }
});