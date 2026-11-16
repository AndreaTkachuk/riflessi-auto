import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

// GET /api/admin/versions?modelId=...
export class ListVersionsQueryDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  modelId?: string;
}
