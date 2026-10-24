import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { BodyType, ModelBadge } from '../../../generated/prisma/client.js';

export class CreateModelDto {
  @IsString()
  @IsNotEmpty()
  brandId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  name!: string;

  // Optional (generated from name), but not nullable: the column is required.
  @ValidateIf((_, value) => value !== undefined)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug: solo lettere minuscole, numeri e trattini',
  })
  slug?: string;

  @IsOptional()
  @IsEnum(BodyType)
  bodyType?: BodyType | null;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string | null;

  // "2026-09-15" (from <input type="date">) or a full ISO date; null clears it.
  @IsOptional()
  @IsDateString({ strict: true })
  launchedAt?: string | null;

  @IsOptional()
  @IsEnum(ModelBadge)
  badge?: ModelBadge | null;
}
