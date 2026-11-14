import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import {
  EmissionClass,
  FuelType,
  Transmission,
} from '../../../generated/prisma/client.js';

export class CreateVersionDto {
  @IsString()
  @IsNotEmpty()
  modelId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  name!: string;

  // Optional (generated from name), but not nullable: the column is required.
  @ValidateIf((_, value) => value !== undefined)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug: solo lettere minuscole, numeri e trattini',
  })
  slug?: string;

  @IsInt()
  @Min(1950)
  @Max(2100)
  yearFrom!: number;

  // null = still on sale. Must not precede yearFrom (checked in the service).
  @IsOptional()
  @IsInt()
  @Min(1950)
  @Max(2100)
  yearTo?: number | null;

  @IsEnum(FuelType)
  fuelType!: FuelType;

  @IsEnum(Transmission)
  transmission!: Transmission;

  // Usually null for electric cars.
  @IsOptional()
  @IsInt()
  @Min(50)
  @Max(10000)
  engineCc?: number | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(2000)
  powerKw?: number | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3000)
  powerHp?: number | null;

  // l/100km (kWh/100km for electric cars); column is Decimal(4,1).
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 1, allowNaN: false, allowInfinity: false })
  @Min(0)
  @Max(999.9)
  consumption?: number | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1000)
  co2Gkm?: number | null;

  @IsOptional()
  @IsEnum(EmissionClass)
  emissionClass?: EmissionClass | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(7)
  doors?: number | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(9)
  seats?: number | null;

  // List price in whole euros.
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10_000_000)
  priceNewEur?: number | null;
}
