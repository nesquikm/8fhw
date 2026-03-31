import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts', 'src/index.ts'],
      thresholds: {
        'src/services/': {
          statements: 80,
          branches: 80,
          functions: 80,
          lines: 80,
        },
        'src/routes/': {
          statements: 70,
          branches: 70,
          functions: 70,
          lines: 70,
        },
      },
    },
    deps: {
      interopDefault: true,
    },
  },
});
