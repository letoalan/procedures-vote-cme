import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
  server: {
    port: 5173,
    open: false
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    // tests d'interface : ajouter en tête du fichier de test
    // le commentaire  // @vitest-environment happy-dom
    coverage: {
      provider: 'v8',
      include: ['src/engine/**']
    }
  }
});
