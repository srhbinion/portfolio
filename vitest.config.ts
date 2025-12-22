import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    include: [
      'src/**/*.test.js', 
      'src/**/*.spec.js',
      'src/**/*.test.ts',
      'src/**/*.spec.ts'
    ]
  },
});