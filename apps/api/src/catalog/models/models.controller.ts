import { Controller, Get, Param } from '@nestjs/common';
import { Public } from '../../auth/decorators/public.decorator.js';
import { ModelsService } from './models.service.js';

// Public catalog routes, addressed by slug.
@Public()
@Controller()
export class ModelsController {
  constructor(private readonly models: ModelsService) {}

  // GET /api/models/novita — newest launched models for the home page.
  @Get('models/novita')
  findNovita() {
    return this.models.findNovita();
  }

  // GET /api/brands/alfa-romeo/models/giulia
  @Get('brands/:brandSlug/models/:modelSlug')
  findOne(
    @Param('brandSlug') brandSlug: string,
    @Param('modelSlug') modelSlug: string,
  ) {
    return this.models.findBySlugs(brandSlug, modelSlug);
  }
}
