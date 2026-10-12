import { Controller, Get, Param } from '@nestjs/common';
import { Public } from '../../auth/decorators/public.decorator.js';
import { BrandsService } from './brands.service.js';

@Public()
@Controller('brands')
export class BrandsController {
  constructor(private readonly brands: BrandsService) {}

  @Get()
  findAll() {
    return this.brands.findAll();
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.brands.findBySlug(slug);
  }
}
