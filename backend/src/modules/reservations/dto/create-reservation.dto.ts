import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateReservationDto {
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @IsOptional()
  @IsUUID()
  resourceId?: string;

  @IsOptional()
  @IsString()
  category?: string; // 'GENERAL', 'TABLETA', etc.
}
