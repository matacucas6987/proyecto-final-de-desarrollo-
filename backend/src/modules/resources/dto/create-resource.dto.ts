import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CollectionType } from '../enums/collection-type.enum';
import { ResourceStatus } from '../enums/resource-status.enum';

export class CreateResourceDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsEnum(CollectionType)
  collection: CollectionType;

  @IsOptional()
  @IsEnum(ResourceStatus)
  status?: ResourceStatus;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  acquisitionDate?: string;

  // Colección específica (opcional según el tipo de colección)
  @IsOptional()
  collectionData?: Record<string, any>;
}
