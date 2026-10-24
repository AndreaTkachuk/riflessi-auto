import type { INestApplication } from '@nestjs/common';
import type { CarModelAdmin } from '@riflessi/shared';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { createTestApp, loginAs, resetDb } from './helpers.js';

describe('Models (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const http = () => request(app.getHttpServer());

  // Brands are created directly in the DB: they are not what these tests are about.
  const createBrand = (name: string, slug: string) =>
    prisma.brand.create({ data: { name, slug } });

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await resetDb(app);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('access to /api/admin/models', () => {
    it('401 when not logged in', () => {
      return http().get('/api/admin/models').expect(401);
    });

    it('403 for a USER', async () => {
      const user = await loginAs(app, 'USER');
      await user.get('/api/admin/models').expect(403);
    });

    it('200 for an EDITOR', async () => {
      const editor = await loginAs(app, 'EDITOR');
      await editor.get('/api/admin/models').expect(200, []);
    });
  });

  describe('admin CRUD as EDITOR', () => {
    let editor: Awaited<ReturnType<typeof loginAs>>;
    let alfaId: string;

    beforeEach(async () => {
      editor = await loginAs(app, 'EDITOR');
      alfaId = (await createBrand('Alfa Romeo', 'alfa-romeo')).id;
    });

    async function createModel(body: object) {
      const res = await editor
        .post('/api/admin/models')
        .send({ brandId: alfaId, ...body })
        .expect(201);
      return res.body as CarModelAdmin;
    }

    it('creates a model in the CarModelAdmin shape', async () => {
      const model = await createModel({
        name: 'Giulia Quadrifoglio',
        bodyType: 'SEDAN',
        launchedAt: '2026-09-15',
        badge: 'FACELIFT',
        description: 'Berlina sportiva',
      });
      expect(model).toEqual({
        id: expect.any(String),
        brandId: alfaId,
        name: 'Giulia Quadrifoglio',
        slug: 'giulia-quadrifoglio',
        bodyType: 'SEDAN',
        description: 'Berlina sportiva',
        launchedAt: '2026-09-15T00:00:00.000Z',
        badge: 'FACELIFT',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        brand: { id: alfaId, name: 'Alfa Romeo' },
        _count: { versions: 0 },
      });
    });

    it('accepts the null values the admin form sends for empty fields', async () => {
      const model = await createModel({
        name: 'Tonale',
        bodyType: null,
        launchedAt: null,
        badge: null,
        description: null,
      });
      expect(model).toMatchObject({
        bodyType: null,
        launchedAt: null,
        badge: null,
      });
    });

    it('unknown brandId → 404 "Marca non trovata"', async () => {
      const res = await editor
        .post('/api/admin/models')
        .send({ brandId: 'nope', name: 'Giulia' })
        .expect(404);
      expect(res.body.message).toBe('Marca non trovata');
    });

    it.each([
      ['missing brandId', { brandId: undefined, name: 'Giulia' }],
      ['empty name', { name: '' }],
      ['invalid body type', { name: 'Giulia', bodyType: 'SPACESHIP' }],
      ['invalid badge', { name: 'Giulia', badge: 'HOT' }],
      ['invalid date', { name: 'Giulia', launchedAt: '15/09/2026' }],
      ['invalid slug', { name: 'Giulia', slug: 'Giulia!' }],
      ['null slug', { name: 'Giulia', slug: null }],
      ['unknown field', { name: 'Giulia', price: 1 }],
    ])('rejects %s (400)', async (_case, body) => {
      await editor
        .post('/api/admin/models')
        .send({ brandId: alfaId, ...body })
        .expect(400);
    });

    it('slug is unique per brand, not globally', async () => {
      await createModel({ name: 'Junior' });
      await editor
        .post('/api/admin/models')
        .send({ brandId: alfaId, name: 'Junior' })
        .expect(409);

      const fiat = await createBrand('Fiat', 'fiat');
      await editor
        .post('/api/admin/models')
        .send({ brandId: fiat.id, name: 'Junior' })
        .expect(201);
    });

    it('admin list is sorted by brand, then model name', async () => {
      const abarth = await createBrand('Abarth', 'abarth');
      await createModel({ name: 'Stelvio' });
      await createModel({ name: 'Giulia' });
      await createModel({ brandId: abarth.id, name: '600e' });

      const res = await editor.get('/api/admin/models').expect(200);
      expect(
        res.body.map((m: CarModelAdmin) => `${m.brand.name} ${m.name}`),
      ).toEqual(['Abarth 600e', 'Alfa Romeo Giulia', 'Alfa Romeo Stelvio']);
    });

    it('PATCH: rename keeps the slug, null clears optional fields', async () => {
      const model = await createModel({
        name: 'Giulia',
        launchedAt: '2026-01-10',
        badge: 'NEW_MODEL',
      });
      const res = await editor
        .patch(`/api/admin/models/${model.id}`)
        .send({ name: 'Giulia 2026', launchedAt: null, badge: null })
        .expect(200);
      expect(res.body).toMatchObject({
        name: 'Giulia 2026',
        slug: 'giulia',
        launchedAt: null,
        badge: null,
      });
    });

    it('PATCH: moves a model to another brand', async () => {
      const model = await createModel({ name: 'Junior' });
      const fiat = await createBrand('Fiat', 'fiat');
      const res = await editor
        .patch(`/api/admin/models/${model.id}`)
        .send({ brandId: fiat.id })
        .expect(200);
      expect(res.body.brand).toEqual({ id: fiat.id, name: 'Fiat' });
    });

    it.each([{ name: null }, { slug: null }, { brandId: null }])(
      'PATCH cannot set a required field to null: %o (400)',
      async (body) => {
        const model = await createModel({ name: 'Giulia' });
        await editor
          .patch(`/api/admin/models/${model.id}`)
          .send(body)
          .expect(400);
      },
    );

    it('PATCH to an unknown brand → 404, unknown model id → 404', async () => {
      const model = await createModel({ name: 'Giulia' });
      await editor
        .patch(`/api/admin/models/${model.id}`)
        .send({ brandId: 'nope' })
        .expect(404);
      await editor
        .patch('/api/admin/models/nope')
        .send({ name: 'X' })
        .expect(404);
    });

    it('DELETE → 204; unknown id → 404', async () => {
      const model = await createModel({ name: 'Giulia' });
      await editor.delete(`/api/admin/models/${model.id}`).expect(204);
      await editor.delete(`/api/admin/models/${model.id}`).expect(404);
    });

    it('DELETE a model that still has versions → 409', async () => {
      const model = await createModel({ name: 'Giulia' });
      await prisma.carVersion.create({
        data: {
          modelId: model.id,
          name: '2.0 Turbo 280 CV',
          slug: '2-0-turbo-280-cv',
          yearFrom: 2026,
          fuelType: 'PETROL',
          transmission: 'AUTOMATIC',
        },
      });
      await editor.delete(`/api/admin/models/${model.id}`).expect(409);
    });
  });

  describe('public routes', () => {
    it('GET /api/models/novita: only launched models, newest first, max 6', async () => {
      const brand = await createBrand('Fiat', 'fiat');
      await prisma.carModel.create({
        data: { brandId: brand.id, name: 'Panda', slug: 'panda' }, // not a novità
      });
      for (let month = 1; month <= 7; month++) {
        await prisma.carModel.create({
          data: {
            brandId: brand.id,
            name: `Model ${month}`,
            slug: `model-${month}`,
            launchedAt: new Date(Date.UTC(2026, month - 1, 1)),
          },
        });
      }

      const res = await http().get('/api/models/novita').expect(200);
      expect(res.body.map((m: { slug: string }) => m.slug)).toEqual([
        'model-7',
        'model-6',
        'model-5',
        'model-4',
        'model-3',
        'model-2',
      ]);
      expect(res.body[0].brand).toEqual({ name: 'Fiat', slug: 'fiat' });
      expect(res.body[0]._count).toEqual({ versions: 0 });
    });

    it('GET /api/brands/:brandSlug/models/:modelSlug with versions, cheapest first', async () => {
      const brand = await createBrand('Alfa Romeo', 'alfa-romeo');
      const model = await prisma.carModel.create({
        data: { brandId: brand.id, name: 'Giulia', slug: 'giulia' },
      });
      const version = (name: string, priceNewEur: number | null) => ({
        modelId: model.id,
        name,
        slug: name.toLowerCase().replaceAll(' ', '-'),
        yearFrom: 2026,
        fuelType: 'PETROL' as const,
        transmission: 'AUTOMATIC' as const,
        priceNewEur,
      });
      await prisma.carVersion.createMany({
        data: [
          version('Veloce', 55000),
          version('Quadrifoglio', 95000),
          version('Sprint', 48000),
          version('Prototipo', null),
        ],
      });

      const res = await http()
        .get('/api/brands/alfa-romeo/models/giulia')
        .expect(200);
      expect(res.body.brand).toMatchObject({
        name: 'Alfa Romeo',
        slug: 'alfa-romeo',
      });
      expect(res.body.versions.map((v: { name: string }) => v.name)).toEqual([
        'Sprint',
        'Veloce',
        'Quadrifoglio',
        'Prototipo',
      ]);
    });

    it('404 "Modello non trovato" when the model belongs to another brand', async () => {
      const alfa = await createBrand('Alfa Romeo', 'alfa-romeo');
      await createBrand('Fiat', 'fiat');
      await prisma.carModel.create({
        data: { brandId: alfa.id, name: 'Giulia', slug: 'giulia' },
      });

      const res = await http()
        .get('/api/brands/fiat/models/giulia')
        .expect(404);
      expect(res.body.message).toBe('Modello non trovato');
    });
  });
});
