import { execSync } from 'node:child_process';
import { assertTestDatabase } from './test-db.js';

// Runs once before all e2e files: creates the test DB if missing and applies migrations.
export default function setup() {
  assertTestDatabase(process.env.DATABASE_URL);
  execSync('pnpm prisma migrate deploy', { stdio: 'inherit' });
}
