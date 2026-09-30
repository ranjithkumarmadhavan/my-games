import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Served at the site root; builds first and owns ../dist.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, strictPort: true },
  build: { outDir: '../dist', emptyOutDir: true },
});
