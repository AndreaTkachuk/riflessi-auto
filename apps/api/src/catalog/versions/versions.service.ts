import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { slugify } from '@riflessi/shared';
import type { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateVersionDto } from './dto/create-version.dto.js';
import { UpdateVersionDto } from './dto/update-version.dto.js';

// Shape of CarVersionAdmin in @riflessi/shared.
const adminInclude = {
  model: {
    select: {
      id: true,
      name: true,
      brand: { select: { id: true, name: true } },
    },
  },
} satisfies Prisma.CarVersionInclude;

@Injectable()
export class VersionsService {
  constructor(private readonly prisma: PrismaService) {}

  findAllAdmin(modelId?: string) {
    return this.prisma.carVersion.findMany({
      where: { modelId },
      orderBy: [
        { model: { brand: { name: 'asc' } } },
        { model: { name: 'asc' } },
        { yearFrom: 'desc' },
        { name: 'asc' },
      ],
      include: adminInclude,
    });
  }

  async create(dto: CreateVersionDto) {
    await this.assertModelExists(dto.modelId);
    assertYears(dto.yearFrom, dto.yearTo);
    const { slug, ...data } = dto;
    return this.prisma.carVersion.create({
      data: { ...data, slug: slug ?? slugify(dto.name) },
      include: adminInclude,
    });
  }

  async update(id: string, dto: UpdateVersionDto) {
    const current = await this.prisma.carVersion.findUnique({
      where: { id },
      select: { yearFrom: true, yearTo: true },
    });
    if (!current) throw new NotFoundException('Versione non trovata');
    if (dto.modelId !== undefined) await this.assertModelExists(dto.modelId);
    // Only one of the two years may be sent: compare with the stored value.
    assertYears(
      dto.yearFrom ?? current.yearFrom,
      dto.yearTo === undefined ? current.yearTo : dto.yearTo,
    );
    return this.prisma.carVersion.update({
      where: { id },
      data: dto,
      include: adminInclude,
    });
  }

  remove(id: string) {
    return this.prisma.carVersion.delete({ where: { id } });
  }

  // Without this check an unknown modelId would surface as a confusing P2003 (409).
  private async assertModelExists(modelId: string) {
    const model = await this.prisma.carModel.findUnique({
      where: { id: modelId },
      select: { id: true },
    });
    if (!model) throw new NotFoundException('Modello non trovato');
  }
}

function assertYears(yearFrom: number, yearTo: number | null | undefined) {
  if (yearTo != null && yearTo < yearFrom) {
    throw new BadRequestException(
      "L'anno di fine produzione non può precedere quello di inizio",
    );
  }
}
