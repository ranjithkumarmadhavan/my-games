import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Served at games.ranjithkumarmadhavan.com/blink-and-draw/
export default defineConfig({
  base: '/blink-and-draw/',
  plugins: [react()],
  server: { port: 5174, strictPort: true },
  build: { outDir: '../dist/blink-and-draw', emptyOutDir: true },
});
