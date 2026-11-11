import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { FineStatus } from '../enums/fine-status.enum';

export class CreateFineDto {
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @IsOptional()
  @IsUUID()
  loanId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  daysOverdue?: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsEnum(FineStatus)
  status?: FineStatus;

  @IsOptional()
  @IsString()
  reason?: string;
}
