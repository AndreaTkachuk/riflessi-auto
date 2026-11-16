import type { INestApplication } from '@nestjs/common';
import type { CarVersionAdmin } from '@riflessi/shared';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { createTestApp, loginAs, resetDb } from './helpers.js';

describe('Versions (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const http = () => request(app.getHttpServer());

  // Brands and models are created directly in the DB: they are not what these tests are about.
  async function createModel(brandName: string, modelName: string) {
    const brand = await prisma.brand.upsert({
      where: { name: brandName },
      update: {},
      create: {
        name: brandName,
        slug: brandName.toLowerCase().replaceAll(' ', '-'),
      },
    });
    return prisma.carModel.create({
      data: {
        brandId: brand.id,
        name: modelName,
        slug: modelName.toLowerCase().replaceAll(' ', '-'),
      },
    });
  }

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

  describe('access to /api/admin/versions', () => {
    it('401 when not logged in', () => {
      return http().get('/api/admin/versions').expect(401);
    });

    it('403 for a USER', async () => {
      const user = await loginAs(app, 'USER');
      await user.get('/api/admin/versions').expect(403);
    });

    it('200 for an EDITOR', async () => {
      const editor = await loginAs(app, 'EDITOR');
      await editor.get('/api/admin/versions').expect(200, []);
    });
  });

  describe('admin CRUD as EDITOR', () => {
    let editor: Awaited<ReturnType<typeof loginAs>>;
    let giuliaId: string;

    // Minimal valid body; tests override what they need.
    const base = () => ({
      modelId: giuliaId,
      name: '2.0 Turbo 280 CV Veloce',
      yearFrom: 2024,
      fuelType: 'PETROL',
      transmission: 'AUTOMATIC',
    });

    beforeEach(async () => {
      editor = await loginAs(app, 'EDITOR');
      giuliaId = (await createModel('Alfa Romeo', 'Giulia')).id;
    });

    async function createVersion(body: object = {}) {
      const res = await editor
        .post('/api/admin/versions')
        .send({ ...base(), ...body })
        .expect(201);
      return res.body as CarVersionAdmin;
    }

    it('creates a version in the CarVersionAdmin shape', async () => {
      const version = await createVersion({
        yearTo: 2026,
        engineCc: 1995,
        powerKw: 206,
        powerHp: 280,
        consumption: 7.4,
        co2Gkm: 168,
        emissionClass: 'EURO_6E_BIS',
        doors: 4,
        seats: 5,
        priceNewEur: 62500,
      });
      expect(version).toEqual({
        id: expect.any(String),
        modelId: giuliaId,
        name: '2.0 Turbo 280 CV Veloce',
        slug: '2-0-turbo-280-cv-veloce',
        yearFrom: 2024,
        yearTo: 2026,
        fuelType: 'PETROL',
        transmission: 'AUTOMATIC',
        engineCc: 1995,
        powerKw: 206,
        powerHp: 280,
        consumption: '7.4',
        co2Gkm: 168,
        batteryKwh: null,
        rangeKm: null,
        emissionClass: 'EURO_6E_BIS',
        doors: 4,
        seats: 5,
        priceNewEur: 62500,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        model: {
          id: giuliaId,
          name: 'Giulia',
          brand: { id: expect.any(String), name: 'Alfa Romeo' },
        },
      });
    });

    it('accepts the null values the admin form sends for empty fields', async () => {
      const version = await createVersion({
        yearTo: null,
        engineCc: null,
        powerKw: null,
        powerHp: null,
        consumption: null,
        co2Gkm: null,
        batteryKwh: null,
        rangeKm: null,
        emissionClass: null,
        doors: null,
        seats: null,
        priceNewEur: null,
      });
      expect(version).toMatchObject({
        yearTo: null,
        consumption: null,
        priceNewEur: null,
      });
    });

    it('unknown modelId → 404 "Modello non trovato"', async () => {
      const res = await editor
        .post('/api/admin/versions')
        .send({ ...base(), modelId: 'nope' })
        .expect(404);
      expect(res.body.message).toBe('Modello non trovato');
    });

    it.each([
      ['missing modelId', { modelId: undefined }],
      ['empty name', { name: '' }],
      ['missing yearFrom', { yearFrom: undefined }],
      ['yearFrom as string', { yearFrom: '2024' }],
      ['yearFrom too old', { yearFrom: 1900 }],
      ['invalid fuel type', { fuelType: 'STEAM' }],
      ['missing transmission', { transmission: undefined }],
      ['invalid emission class', { emissionClass: 'EURO_9' }],
      ['non-integer power', { powerKw: 150.5 }],
      ['negative price', { priceNewEur: -1 }],
      ['consumption with 2 decimals', { consumption: 5.45 }],
      ['battery with 2 decimals', { batteryKwh: 44.25 }],
      ['zero range', { rangeKm: 0 }],
      ['null slug', { slug: null }],
      ['unknown field', { color: 'rosso' }],
    ])('rejects %s (400)', async (_case, body) => {
      await editor
        .post('/api/admin/versions')
        .send({ ...base(), ...body })
        .expect(400);
    });

    it('electric version: battery as a Decimal string, range, no engine', async () => {
      const version = await createVersion({
        name: 'Elettrica 113 CV',
        fuelType: 'ELECTRIC',
        engineCc: null,
        batteryKwh: 44,
        rangeKm: 320,
        consumption: 16.9,
      });
      expect(version).toMatchObject({
        fuelType: 'ELECTRIC',
        engineCc: null,
        batteryKwh: '44',
        rangeKm: 320,
        consumption: '16.9',
      });
    });

    it('accepts MILD_HYBRID', async () => {
      const version = await createVersion({ fuelType: 'MILD_HYBRID' });
      expect(version.fuelType).toBe('MILD_HYBRID');
    });

    it('yearTo before yearFrom → 400', async () => {
      const res = await editor
        .post('/api/admin/versions')
        .send({ ...base(), yearFrom: 2024, yearTo: 2020 })
        .expect(400);
      expect(res.body.message).toMatch(/anno di fine/);
    });

    it('slug is unique per model, not globally', async () => {
      await createVersion();
      await editor.post('/api/admin/versions').send(base()).expect(409);

      const stelvio = await createModel('Alfa Romeo', 'Stelvio');
      await createVersion({ modelId: stelvio.id });
    });

    it('list: filtered by modelId, sorted by brand, model, newest year', async () => {
      const panda = await createModel('Fiat', 'Panda');
      await createVersion({ name: 'Sprint', yearFrom: 2023 });
      await createVersion({ name: 'Veloce', yearFrom: 2025 });
      await createVersion({ modelId: panda.id, name: 'Hybrid' });

      const all = await editor.get('/api/admin/versions').expect(200);
      expect(
        all.body.map((v: CarVersionAdmin) => `${v.model.name} ${v.name}`),
      ).toEqual(['Giulia Veloce', 'Giulia Sprint', 'Panda Hybrid']);

      const onlyPanda = await editor
        .get(`/api/admin/versions?modelId=${panda.id}`)
        .expect(200);
      expect(onlyPanda.body.map((v: CarVersionAdmin) => v.name)).toEqual([
        'Hybrid',
      ]);
    });

    it('PATCH: rename keeps the slug, null clears optional fields', async () => {
      const version = await createVersion({
        priceNewEur: 50000,
        consumption: 6,
      });
      const res = await editor
        .patch(`/api/admin/versions/${version.id}`)
        .send({ name: 'Veloce 2026', priceNewEur: null, consumption: null })
        .expect(200);
      expect(res.body).toMatchObject({
        name: 'Veloce 2026',
        slug: version.slug,
        priceNewEur: null,
        consumption: null,
      });
    });

    it('PATCH: yearTo is checked against the stored yearFrom', async () => {
      const version = await createVersion({ yearFrom: 2024 });
      await editor
        .patch(`/api/admin/versions/${version.id}`)
        .send({ yearTo: 2022 })
        .expect(400);
      await editor
        .patch(`/api/admin/versions/${version.id}`)
        .send({ yearTo: 2026 })
        .expect(200);
      // Now moving yearFrom past the stored yearTo must fail too.
      await editor
        .patch(`/api/admin/versions/${version.id}`)
        .send({ yearFrom: 2027 })
        .expect(400);
    });

    it.each([
      { name: null },
      { slug: null },
      { modelId: null },
      { yearFrom: null },
      { fuelType: null },
      { transmission: null },
    ])('PATCH cannot set a required field to null: %o (400)', async (body) => {
      const version = await createVersion();
      await editor
        .patch(`/api/admin/versions/${version.id}`)
        .send(body)
        .expect(400);
    });

    it('PATCH to an unknown model → 404, unknown version id → 404', async () => {
      const version = await createVersion();
      await editor
        .patch(`/api/admin/versions/${version.id}`)
        .send({ modelId: 'nope' })
        .expect(404);
      const res = await editor
        .patch('/api/admin/versions/nope')
        .send({ name: 'X' })
        .expect(404);
      expect(res.body.message).toBe('Versione non trovata');
    });

    it('DELETE → 204; unknown id → 404', async () => {
      const version = await createVersion();
      await editor.delete(`/api/admin/versions/${version.id}`).expect(204);
      await editor.delete(`/api/admin/versions/${version.id}`).expect(404);
    });

    it('a new version is counted in the admin models list', async () => {
      await createVersion();
      const res = await editor.get('/api/admin/models').expect(200);
      expect(res.body[0]._count).toEqual({ versions: 1 });
    });
  });
});
