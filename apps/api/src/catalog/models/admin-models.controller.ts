import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Roles } from '../../auth/decorators/roles.decorator.js';
import { CreateModelDto } from './dto/create-model.dto.js';
import { UpdateModelDto } from './dto/update-model.dto.js';
import { ModelsService } from './models.service.js';

@Roles('ADMIN', 'EDITOR')
@Controller('admin/models')
export class AdminModelsController {
  constructor(private readonly models: ModelsService) {}

  @Get()
  findAll() {
    return this.models.findAllAdmin();
  }

  @Post()
  create(@Body() dto: CreateModelDto) {
    return this.models.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateModelDto) {
    return this.models.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    await this.models.remove(id);
  }
}
