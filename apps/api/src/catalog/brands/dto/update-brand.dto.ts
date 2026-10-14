import { PartialType } from '@nestjs/mapped-types';
import { CreateBrandDto } from './create-brand.dto.js';

// skipNullProperties: false → a missing field is optional, but `null` is still validated.
// So { name: null } fails with 400 (instead of a Prisma 500), while fields that are
// @IsOptional() in CreateBrandDto (country, logoUrl) can still be cleared with null.
export class UpdateBrandDto extends PartialType(CreateBrandDto, {
  skipNullProperties: false,
}) {}
