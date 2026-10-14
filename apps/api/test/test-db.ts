// E2E tests always use the database "riflessi_test" on the server from DATABASE_URL,
// so they can never wipe the dev database (riflessi) by mistake.
export const TEST_DB_NAME = 'riflessi_test';

export function testDatabaseUrl() {
  const base = process.env.DATABASE_URL;
  if (!base) throw new Error('DATABASE_URL is not set');
  const url = new URL(base);
  url.pathname = `/${TEST_DB_NAME}`;
  return url.toString();
}

export function assertTestDatabase(databaseUrl: string | undefined) {
  if (!databaseUrl || new URL(databaseUrl).pathname !== `/${TEST_DB_NAME}`) {
    throw new Error(`E2E tests must run against "${TEST_DB_NAME}"`);
  }
}
