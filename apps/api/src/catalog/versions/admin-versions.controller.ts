import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Roles } from '../../auth/decorators/roles.decorator.js';
import { CreateVersionDto } from './dto/create-version.dto.js';
import { ListVersionsQueryDto } from './dto/list-versions-query.dto.js';
import { UpdateVersionDto } from './dto/update-version.dto.js';
import { VersionsService } from './versions.service.js';

@Roles('ADMIN', 'EDITOR')
@Controller('admin/versions')
export class AdminVersionsController {
  constructor(private readonly versions: VersionsService) {}

  @Get()
  findAll(@Query() query: ListVersionsQueryDto) {
    return this.versions.findAllAdmin(query.modelId);
  }

  @Post()
  create(@Body() dto: CreateVersionDto) {
    return this.versions.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateVersionDto) {
    return this.versions.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    await this.versions.remove(id);
  }
}
