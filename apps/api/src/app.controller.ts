import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';
import { Public } from './auth/decorators/public.decorator.js';
import { Roles } from './auth/decorators/roles.decorator.js';
import { PrismaService } from './prisma/prisma.service.js';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Public()
  @Get('brands')
  getBrands() {
    return this.prisma.brand.findMany({ orderBy: { name: 'asc' } });
  }

  @Roles('ADMIN')
  @Get('admin/ping')
  adminPing() {
    return { ok: true, message: 'Ciao admin' };
  }
}
