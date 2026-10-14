import { defineConfig } from 'vitest/config';

// Vite 8 compiles TS with Oxc, which emits decorator metadata (emitDecoratorMetadata
// from tsconfig), so Nest DI works in tests without SWC.
export default defineConfig({
  test: {
    globals: true,
    root: './',
    include: ['**/*.spec.ts'],
  },
});
