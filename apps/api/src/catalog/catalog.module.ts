import { Module } from '@nestjs/common';
import { AdminBrandsController } from './brands/admin-brands.controller.js';
import { BrandsController } from './brands/brands.controller.js';
import { BrandsService } from './brands/brands.service.js';
import { AdminModelsController } from './models/admin-models.controller.js';
import { ModelsController } from './models/models.controller.js';
import { ModelsService } from './models/models.service.js';

@Module({
  controllers: [
    BrandsController,
    AdminBrandsController,
    ModelsController,
    AdminModelsController,
  ],
  providers: [BrandsService, ModelsService],
})
export class CatalogModule {}
