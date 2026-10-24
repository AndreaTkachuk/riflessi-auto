import { Injectable, NotFoundException } from '@nestjs/common';
import { slugify } from '@riflessi/shared';
import type { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateModelDto } from './dto/create-model.dto.js';
import { UpdateModelDto } from './dto/update-model.dto.js';

// Shape of CarModelAdmin in @riflessi/shared.
const adminInclude = {
  brand: { select: { id: true, name: true } },
  _count: { select: { versions: true } },
} satisfies Prisma.CarModelInclude;

const NOVITA_LIMIT = 6;

// undefined = field not sent (keep), null = clear, string = ISO date.
function toDate(value: string | null | undefined) {
  if (value === undefined) return undefined;
  return value === null ? null : new Date(value);
}

@Injectable()
export class ModelsService {
  constructor(private readonly prisma: PrismaService) {}

  findNovita() {
    return this.prisma.carModel.findMany({
      where: { launchedAt: { not: null } },
      orderBy: { launchedAt: 'desc' },
      take: NOVITA_LIMIT,
      include: {
        brand: { select: { name: true, slug: true } },
        _count: { select: { versions: true } },
      },
    });
  }

  async findBySlugs(brandSlug: string, modelSlug: string) {
    const model = await this.prisma.carModel.findFirst({
      where: { slug: modelSlug, brand: { slug: brandSlug } },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
            slug: true,
            country: true,
            logoUrl: true,
          },
        },
        versions: {
          orderBy: [
            { priceNewEur: { sort: 'asc', nulls: 'last' } },
            { name: 'asc' },
          ],
        },
      },
    });
    if (!model) throw new NotFoundException('Modello non trovato');
    return model;
  }

  findAllAdmin() {
    return this.prisma.carModel.findMany({
      orderBy: [{ brand: { name: 'asc' } }, { name: 'asc' }],
      include: adminInclude,
    });
  }

  async create(dto: CreateModelDto) {
    await this.assertBrandExists(dto.brandId);
    return this.prisma.carModel.create({
      data: {
        brandId: dto.brandId,
        name: dto.name,
        slug: dto.slug ?? slugify(dto.name),
        bodyType: dto.bodyType,
        description: dto.description,
        launchedAt: toDate(dto.launchedAt),
        badge: dto.badge,
      },
      include: adminInclude,
    });
  }

  async update(id: string, dto: UpdateModelDto) {
    if (dto.brandId !== undefined) await this.assertBrandExists(dto.brandId);
    return this.prisma.carModel.update({
      where: { id },
      data: {
        brandId: dto.brandId,
        name: dto.name,
        slug: dto.slug,
        bodyType: dto.bodyType,
        description: dto.description,
        launchedAt: toDate(dto.launchedAt),
        badge: dto.badge,
      },
      include: adminInclude,
    });
  }

  remove(id: string) {
    return this.prisma.carModel.delete({ where: { id } });
  }

  // Without this check an unknown brandId would surface as a confusing P2003 (409).
  private async assertBrandExists(brandId: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { id: brandId },
      select: { id: true },
    });
    if (!brand) throw new NotFoundException('Marca non trovata');
  }
}
