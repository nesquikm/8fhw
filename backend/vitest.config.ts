import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts', 'src/index.ts'],
      thresholds: {
        // Backend coverage targets from testing-spec.md
        // Services: 80%+, Routes: 70%+
        // Applied globally for now; per-directory thresholds can be added later
      },
    },
    deps: {
      interopDefault: true,
    },
  },
});
