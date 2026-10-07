import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@shared': path.resolve(import.meta.dirname, 'shared'),
        '@': path.resolve(import.meta.dirname, 'src'),
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      // Les données serveur (SQLite, cache audio, certificats) et les dossiers hors appli
      // ne doivent jamais déclencher de rechargement du navigateur.
      watch:
        process.env.DISABLE_HMR === 'true'
          ? null
          : { ignored: ['**/data/**', '**/certs/**', '**/finetune/**', '**/services/**', '**/firmware/**', '**/docs/**'] },
    },
  };
});
