import { defineConfig } from 'vitest/config';

export default defineConfig({
  build: {
    outDir: '_site/assets/js',
    emptyOutDir: false,
    rollupOptions: {
      input: {
        main: 'src/assets/js/main.ts',
      },
      output: {
        entryFileNames: 'main.js',
        format: 'es',
      },
      external: [], // Bundle all dependencies, don't mark any as external
    },
  },
  css: {
    postcss: './postcss.config.js',
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    include: [
      'src/**/*.test.js',
      'src/**/*.spec.js',
      'src/**/*.test.ts',
      'src/**/*.spec.ts',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test/',
        '**/*.test.ts',
      ],
    },
  },
});
