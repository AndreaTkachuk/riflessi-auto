import { PartialType } from '@nestjs/mapped-types';
import { CreateVersionDto } from './create-version.dto.js';

// See UpdateBrandDto: null is validated, so only @IsOptional() fields can be cleared.
export class UpdateVersionDto extends PartialType(CreateVersionDto, {
  skipNullProperties: false,
}) {}
