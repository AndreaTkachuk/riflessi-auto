import { Injectable, NotFoundException } from '@nestjs/common';
import { slugify } from '@riflessi/shared';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateBrandDto } from './dto/create-brand.dto.js';
import { UpdateBrandDto } from './dto/update-brand.dto.js';

@Injectable()
export class BrandsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.brand.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { models: true } } },
    });
  }

  async findBySlug(slug: string) {
    const brand = await this.prisma.brand.findUnique({
      where: { slug },
      include: { models: { orderBy: { name: 'asc' } } },
    });
    if (!brand) throw new NotFoundException('Marca non trovata');
    return brand;
  }

  create(dto: CreateBrandDto) {
    return this.prisma.brand.create({
      data: {
        name: dto.name,
        slug: dto.slug ?? slugify(dto.name),
        country: dto.country,
        logoUrl: dto.logoUrl,
      },
    });
  }

  update(id: string, dto: UpdateBrandDto) {
    return this.prisma.brand.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.prisma.brand.delete({ where: { id } });
  }
}
