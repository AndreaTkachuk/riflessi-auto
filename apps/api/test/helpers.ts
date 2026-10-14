import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';
import { setupApp } from '../src/app.setup.js';
import type { Role } from '../src/generated/prisma/client.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { assertTestDatabase } from './test-db.js';

export const PASSWORD = 'password123';

export async function createTestApp() {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();
  const app = setupApp(
    moduleRef.createNestApplication<INestApplication<App>>(),
  );
  await app.init();
  return app;
}

// Empties every table (except Prisma's migrations table) before each test.
export async function resetDb(app: INestApplication) {
  assertTestDatabase(process.env.DATABASE_URL);
  const prisma = app.get(PrismaService);
  const tables = await prisma.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'`;
  if (tables.length === 0) return;
  const list = tables.map((t) => `"${t.tablename}"`).join(', ');
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${list} CASCADE`);
}

// Registers a user with the given role and returns a supertest agent that keeps the auth cookie,
// like a logged-in browser.
export async function loginAs(app: INestApplication<App>, role: Role) {
  const email = `${role.toLowerCase()}@test.it`;
  const agent = request.agent(app.getHttpServer());
  await agent
    .post('/api/auth/register')
    .send({ email, password: PASSWORD })
    .expect(201);
  if (role !== 'USER') {
    // The role is read from the DB on every request, so no re-login is needed.
    await app
      .get(PrismaService)
      .user.update({ where: { email }, data: { role } });
  }
  return agent;
}
