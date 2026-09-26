import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

const hasManagedPort = Boolean(process.env.PORT);

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: process.env.BASE_PATH ?? '/',
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: Number(process.env.PORT ?? 5173),
    strictPort: hasManagedPort,
    host: '0.0.0.0',
    allowedHosts: true,
  },
  preview: {
    port: Number(process.env.PORT ?? 4173),
    host: '0.0.0.0',
    allowedHosts: true,
  },
});
