import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mockApi from './dev/mockApi.js';

// Served at games.ranjithkumarmadhavan.com/hand-cricket/
// In production the PHP API in public/api/ handles rooms; in dev an in-memory mock does.
export default defineConfig({
  base: '/hand-cricket/',
  plugins: [react(), mockApi()],
  server: { port: 5175, strictPort: true },
  build: { outDir: '../dist/hand-cricket', emptyOutDir: true },
});
