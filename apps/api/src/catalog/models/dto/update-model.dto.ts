import { PartialType } from '@nestjs/mapped-types';
import { CreateModelDto } from './create-model.dto.js';

// See UpdateBrandDto: null is validated, so only @IsOptional() fields can be cleared.
export class UpdateModelDto extends PartialType(CreateModelDto, {
  skipNullProperties: false,
}) {}
