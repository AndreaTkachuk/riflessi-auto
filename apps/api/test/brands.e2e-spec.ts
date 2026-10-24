import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { createTestApp, loginAs, resetDb } from './helpers.js';

describe('Brands (e2e)', () => {
  let app: INestApplication<App>;
  const http = () => request(app.getHttpServer());

  beforeAll(async () => {
    app = await createTestApp();
  });

  beforeEach(async () => {
    await resetDb(app);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('access to /api/admin/brands', () => {
    const brand = { name: 'Alfa Romeo' };

    it('401 when not logged in', () => {
      return http().post('/api/admin/brands').send(brand).expect(401);
    });

    it('403 for a USER', async () => {
      const user = await loginAs(app, 'USER');
      await user.post('/api/admin/brands').send(brand).expect(403);
    });

    it.each(['ADMIN', 'EDITOR'] as const)('201 for %s', async (role) => {
      const agent = await loginAs(app, role);
      await agent.post('/api/admin/brands').send(brand).expect(201);
    });
  });

  describe('as EDITOR', () => {
    let editor: Awaited<ReturnType<typeof loginAs>>;

    beforeEach(async () => {
      editor = await loginAs(app, 'EDITOR');
    });

    async function createBrand(body: object) {
      const res = await editor.post('/api/admin/brands').send(body).expect(201);
      return res.body as { id: string; slug: string };
    }

    it('generates the slug from the name', async () => {
      const brand = await createBrand({ name: 'Citroën', country: 'Francia' });
      expect(brand).toMatchObject({ slug: 'citroen', country: 'Francia' });
    });

    it('accepts a custom slug, rejects an invalid one (400)', async () => {
      const brand = await createBrand({
        name: 'Mercedes-Benz',
        slug: 'mercedes',
      });
      expect(brand.slug).toBe('mercedes');
      await editor
        .post('/api/admin/brands')
        .send({ name: 'BMW', slug: 'Not Valid!' })
        .expect(400);
    });

    it('rejects a duplicate name (409, Italian message)', async () => {
      await createBrand({ name: 'Fiat' });
      const res = await editor
        .post('/api/admin/brands')
        .send({ name: 'Fiat' })
        .expect(409);
      expect(res.body.message).toBe('Esiste già un elemento con questo valore');
    });

    it('public list and detail by slug', async () => {
      await createBrand({ name: 'Lancia' });
      await createBrand({ name: 'Abarth' });

      const list = await http().get('/api/brands').expect(200);
      expect(list.body.map((b: { name: string }) => b.name)).toEqual([
        'Abarth',
        'Lancia',
      ]);
      expect(list.body[0]._count).toEqual({ models: 0 });

      const detail = await http().get('/api/brands/lancia').expect(200);
      expect(detail.body).toMatchObject({ name: 'Lancia', models: [] });
    });

    it('unknown slug → 404 "Marca non trovata"', async () => {
      const res = await http().get('/api/brands/nope').expect(404);
      expect(res.body.message).toBe('Marca non trovata');
    });

    it('rename keeps the slug (SEO), null clears optional fields', async () => {
      const brand = await createBrand({ name: 'Alfa', country: 'Italia' });
      const res = await editor
        .patch(`/api/admin/brands/${brand.id}`)
        .send({ name: 'Alfa Romeo', country: null })
        .expect(200);
      expect(res.body).toMatchObject({
        name: 'Alfa Romeo',
        slug: 'alfa',
        country: null,
      });
    });

    it.each([{ name: null }, { slug: null }])(
      'PATCH cannot set a required field to null: %o (400)',
      async (body) => {
        const brand = await createBrand({ name: 'Jeep' });
        await editor
          .patch(`/api/admin/brands/${brand.id}`)
          .send(body)
          .expect(400);
      },
    );

    it('PATCH / DELETE of an unknown id → 404', async () => {
      await editor
        .patch('/api/admin/brands/nope')
        .send({ name: 'X Y' })
        .expect(404);
      await editor.delete('/api/admin/brands/nope').expect(404);
    });

    it('DELETE → 204, then the brand is gone', async () => {
      const brand = await createBrand({ name: 'Smart' });
      await editor.delete(`/api/admin/brands/${brand.id}`).expect(204);
      await http().get('/api/brands/smart').expect(404);
    });

    it('DELETE a brand that still has models → 409', async () => {
      const brand = await createBrand({ name: 'Toyota' });
      await app.get(PrismaService).carModel.create({
        data: { brandId: brand.id, name: 'Yaris', slug: 'yaris' },
      });
      await editor.delete(`/api/admin/brands/${brand.id}`).expect(409);
    });
  });
});
