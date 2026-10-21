import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

/**
 * Site vitrine LeGriot, statique, publié sur GitHub Pages :
 *   https://fantiflex.github.io/griot/
 * npm run site:dev     développement local
 * npm run site:build   build dans site-dist/
 * npm run site:deploy  build + publication sur la branche gh-pages
 */
const root = import.meta.dirname;

export default defineConfig({
  root,
  base: process.env.SITE_BASE ?? '/griot/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@shared': path.resolve(root, '../shared'),
      '@content': path.resolve(root, '../content'),
      '@app': path.resolve(root, '../src'),
      '@site': path.resolve(root, 'src'),
    },
  },
  build: {
    outDir: path.resolve(root, '../site-dist'),
    emptyOutDir: true,
  },
  server: { port: 5174 },
});
