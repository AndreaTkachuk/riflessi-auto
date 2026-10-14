import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { createTestApp, PASSWORD, resetDb } from './helpers.js';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  const http = () => request(app.getHttpServer());
  const credentials = { email: 'mario@test.it', password: PASSWORD };

  beforeAll(async () => {
    app = await createTestApp();
  });

  beforeEach(async () => {
    await resetDb(app);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/auth/register', () => {
    it('creates a USER, sets an httpOnly cookie, never returns the hash', async () => {
      const res = await http()
        .post('/api/auth/register')
        .send({ ...credentials, name: 'Mario' })
        .expect(201);

      expect(res.body).toEqual({
        id: expect.any(String),
        email: 'mario@test.it',
        name: 'Mario',
        role: 'USER',
      });
      const cookie = res.get('Set-Cookie')?.[0] ?? '';
      expect(cookie).toMatch(/^access_token=/);
      expect(cookie).toContain('HttpOnly');
      expect(cookie).toContain('SameSite=Lax');
    });

    it('normalizes the email (trim + lowercase)', async () => {
      const res = await http()
        .post('/api/auth/register')
        .send({ email: 'Mario@Test.IT', password: PASSWORD })
        .expect(201);
      expect(res.body.email).toBe('mario@test.it');
    });

    it('rejects a duplicate email (409)', async () => {
      await http().post('/api/auth/register').send(credentials).expect(201);
      const res = await http()
        .post('/api/auth/register')
        .send(credentials)
        .expect(409);
      expect(res.body.message).toBe('Email già registrata');
    });

    it.each([
      ['invalid email', { email: 'nope', password: PASSWORD }],
      ['short password', { email: 'a@test.it', password: '123' }],
      ['unknown field', { ...credentials, role: 'ADMIN' }],
    ])('rejects %s (400)', async (_case, body) => {
      await http().post('/api/auth/register').send(body).expect(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await http().post('/api/auth/register').send(credentials).expect(201);
    });

    it('logs in and sets the cookie (200)', async () => {
      const res = await http()
        .post('/api/auth/login')
        .send(credentials)
        .expect(200);
      expect(res.body.email).toBe(credentials.email);
      expect(res.get('Set-Cookie')?.[0]).toMatch(/^access_token=/);
    });

    it('same 401 message for wrong password and unknown email', async () => {
      const wrongPassword = await http()
        .post('/api/auth/login')
        .send({ ...credentials, password: 'wrong-password' })
        .expect(401);
      const unknownEmail = await http()
        .post('/api/auth/login')
        .send({ ...credentials, email: 'nobody@test.it' })
        .expect(401);
      expect(wrongPassword.body.message).toBe('Credenziali non valide');
      expect(unknownEmail.body.message).toBe(wrongPassword.body.message);
    });
  });

  describe('GET /api/auth/me and logout', () => {
    it('401 without cookie', () => {
      return http().get('/api/auth/me').expect(401);
    });

    it('401 with a forged token', () => {
      return http()
        .get('/api/auth/me')
        .set('Cookie', 'access_token=not-a-real-jwt')
        .expect(401);
    });

    it('returns the user while logged in, 401 after logout', async () => {
      const agent = request.agent(app.getHttpServer());
      await agent.post('/api/auth/register').send(credentials).expect(201);

      const me = await agent.get('/api/auth/me').expect(200);
      expect(me.body).toMatchObject({ email: credentials.email, role: 'USER' });
      expect(me.body).not.toHaveProperty('passwordHash');

      await agent.post('/api/auth/logout').expect(204);
      await agent.get('/api/auth/me').expect(401);
    });
  });
});
