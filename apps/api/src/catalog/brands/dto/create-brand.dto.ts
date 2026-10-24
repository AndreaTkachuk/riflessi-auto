import {
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class CreateBrandDto {
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  name!: string;

  // Optional (generated from name), but not nullable: the column is required.
  @ValidateIf((_, value) => value !== undefined)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug: solo lettere minuscole, numeri e trattini',
  })
  slug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  country?: string;

  @IsOptional()
  @IsUrl()
  logoUrl?: string;
}
