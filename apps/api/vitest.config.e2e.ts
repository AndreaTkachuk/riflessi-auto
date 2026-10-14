import { defineConfig } from 'vitest/config';
import { testDatabaseUrl } from './test/test-db.js';

// Set before globalSetup and the test workers start, so both see the test DB.
process.env.DATABASE_URL = testDatabaseUrl();
process.env.JWT_SECRET = 'e2e-secret';

export default defineConfig({
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
    globalSetup: ['./test/global-setup.ts'],
    // All files share one database: run them one at a time.
    fileParallelism: false,
  },
});
