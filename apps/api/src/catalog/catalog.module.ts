import { Module } from '@nestjs/common';
import { AdminBrandsController } from './brands/admin-brands.controller.js';
import { BrandsController } from './brands/brands.controller.js';
import { BrandsService } from './brands/brands.service.js';

@Module({
  controllers: [BrandsController, AdminBrandsController],
  providers: [BrandsService],
})
export class CatalogModule {}
